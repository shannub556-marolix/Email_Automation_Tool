from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, BackgroundTasks, Query
from database import email_records_collection, users_collection
from schemas import EmailRecordOut, EmailLogResponse
from utils import decode_access_token, validate_smtp_login
from fastapi.security import OAuth2PasswordBearer
from typing import List, Optional
import pandas as pd
import io
import smtplib
from email.mime.text import MIMEText
from config import SMTP_HOST, SMTP_PORT
from bson import ObjectId
from datetime import datetime
import re
import uuid
import pytz

router = APIRouter(tags=["emails"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

# Dependency to get current user
async def get_current_user(token: str = Depends(oauth2_scheme)):
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = await users_collection.find_one({"email": payload["sub"]})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

# Upload and send emails
@router.post("/upload-excel")
async def upload_excel(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    smtp_email: str = Form(...),
    smtp_password: str = Form(...),
    subject: str = Form(...),
    body: str = Form(...),
    user: dict = Depends(get_current_user)
):
    batch_id = str(uuid.uuid4())
    if not file.filename.endswith('.xlsx'):
        raise HTTPException(status_code=400, detail="Only .xlsx files are allowed")
    if not validate_smtp_login(smtp_email, smtp_password, SMTP_HOST, SMTP_PORT):
        raise HTTPException(status_code=401, detail="Invalid SMTP credentials")
    content = file.file.read()
    df = pd.read_excel(io.BytesIO(content))
    if 'email' not in df.columns:
        raise HTTPException(status_code=400, detail="Excel must have an 'email' column")
    email_pattern = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
    records = []
    invalid_emails = []
    IST = pytz.timezone('Asia/Kolkata')
    for index, row in df.iterrows():
        recipient = str(row['email']).strip()
        current_time_ist = datetime.now(pytz.UTC).astimezone(IST)
        if not recipient or recipient.lower() in ['nan', 'none', '']:
            error_msg = f"Row {index + 1}: Empty email"
            record_data = {
                "recipient": recipient,
                "status": "failed",
                "error": error_msg,
                "subject": subject,
                "body": body,
                "user_id": str(user["_id"]),
                "timestamp": current_time_ist,
                "batch_id": batch_id
            }
            result = await email_records_collection.insert_one(record_data)
            record_data["id"] = str(result.inserted_id)
            records.append(record_data)
            invalid_emails.append(error_msg)
            continue
        if not email_pattern.match(recipient):
            error_msg = f"Row {index + 1}: Invalid email format - {recipient}"
            record_data = {
                "recipient": recipient,
                "status": "failed",
                "error": error_msg,
                "subject": subject,
                "body": body,
                "user_id": str(user["_id"]),
                "timestamp": current_time_ist,
                "batch_id": batch_id
            }
            result = await email_records_collection.insert_one(record_data)
            record_data["id"] = str(result.inserted_id)
            records.append(record_data)
            invalid_emails.append(error_msg)
            continue
        personalized_body = body
        for col in df.columns:
            if f'{{{col}}}' in personalized_body:
                personalized_body = personalized_body.replace(f'{{{col}}}', str(row[col]))
        record_data = {
            "recipient": recipient,
            "status": "pending",
            "error": None,
            "subject": subject,
            "body": personalized_body,
            "user_id": str(user["_id"]),
            "timestamp": current_time_ist,
            "batch_id": batch_id
        }
        result = await email_records_collection.insert_one(record_data)
        record_data["id"] = str(result.inserted_id)
        records.append(record_data)
    # Schedule background task to send emails for this batch
    background_tasks.add_task(send_batch_emails, batch_id, smtp_email, smtp_password)
    message = f"{len(records)} emails queued for sending."
    if invalid_emails:
        message += f" {len(invalid_emails)} invalid emails were skipped."
        if len(invalid_emails) <= 3:
            message += f" Issues: {', '.join(invalid_emails)}"
        else:
            message += f" Issues: {', '.join(invalid_emails[:3])} and {len(invalid_emails) - 3} more..."
    return {"message": message, "batch_id": batch_id, "total": len(records)}

# New function to send all emails in a batch in the background
async def send_batch_emails(batch_id: str, smtp_email: str, smtp_password: str):
    cursor = email_records_collection.find({"batch_id": batch_id, "status": "pending"})
    async for record in cursor:
        await send_email_task(str(record["_id"]), smtp_email, smtp_password)

async def send_email_task(record_id: str, smtp_email: str, smtp_password: str):
    record = await email_records_collection.find_one({"_id": ObjectId(record_id)})
    if not record:
        return
    
    try:
        msg = MIMEText(record["body"], "plain")
        msg["Subject"] = record["subject"]
        msg["From"] = smtp_email
        msg["To"] = record["recipient"]
        
        server = smtplib.SMTP(SMTP_HOST, SMTP_PORT)
        server.starttls()
        server.login(smtp_email, smtp_password)
        
        # Send the email
        server.sendmail(smtp_email, [record["recipient"]], msg.as_string())
        server.quit()
        
        await email_records_collection.update_one(
            {"_id": ObjectId(record_id)},
            {"$set": {"status": "sent", "error": None}}
        )
    except smtplib.SMTPRecipientsRefused as e:
        error_msg = f"Recipient refused: {record['recipient']} - Email address not found or invalid"
        await email_records_collection.update_one(
            {"_id": ObjectId(record_id)},
            {"$set": {"status": "failed", "error": error_msg}}
        )
    except smtplib.SMTPAuthenticationError as e:
        error_msg = f"SMTP Authentication failed: {str(e)}"
        await email_records_collection.update_one(
            {"_id": ObjectId(record_id)},
            {"$set": {"status": "failed", "error": error_msg}}
        )
    except smtplib.SMTPException as e:
        error_msg = f"SMTP Error: {str(e)}"
        await email_records_collection.update_one(
            {"_id": ObjectId(record_id)},
            {"$set": {"status": "failed", "error": error_msg}}
        )
    except Exception as e:
        error_msg = f"Unexpected error: {str(e)}"
        await email_records_collection.update_one(
            {"_id": ObjectId(record_id)},
            {"$set": {"status": "failed", "error": error_msg}}
        )

# Get real-time email sending status
@router.get("/emails/status")
async def get_email_status(user: dict = Depends(get_current_user), batch_id: str = None):
    query = {"user_id": str(user["_id"])}
    if batch_id:
        query["batch_id"] = batch_id
    else:
        # Find the latest batch_id for this user
        latest = await email_records_collection.find_one({"user_id": str(user["_id"])} , sort=[("timestamp", -1)])
        if latest and "batch_id" in latest:
            query["batch_id"] = latest["batch_id"]
    pipeline = [
        {"$match": query},
        {"$group": {
            "_id": "$status",
            "count": {"$sum": 1}
        }}
    ]
    cursor = email_records_collection.aggregate(pipeline)
    status_counts = {}
    async for doc in cursor:
        status_counts[doc["_id"]] = doc["count"]
    total = sum(status_counts.values())
    sent = status_counts.get("sent", 0)
    failed = status_counts.get("failed", 0)
    pending = status_counts.get("pending", 0)
    return {
        "total": total,
        "sent": sent,
        "failed": failed,
        "pending": pending
    }

# Email logs with pagination and search
@router.get("/emails/logs", response_model=EmailLogResponse)
async def get_logs(
    user: dict = Depends(get_current_user),
    page: int = Query(1, ge=1),
    search: Optional[str] = None
):
    query = {"user_id": str(user["_id"])}
    if search:
        query["recipient"] = {"$regex": search, "$options": "i"}
    
    total = await email_records_collection.count_documents(query)
    per_page = 20
    skip = (page - 1) * per_page
    
    cursor = email_records_collection.find(query).sort("timestamp", -1).skip(skip).limit(per_page)
    emails = []
    async for doc in cursor:
        doc["id"] = str(doc["_id"])
        emails.append(doc)
    
    total_pages = (total + per_page - 1) // per_page
    
    return EmailLogResponse(
        totalCount=total,
        emails=emails,
        page=page,
        totalPages=total_pages
    )

# Delete emails
@router.delete("/emails")
async def delete_emails(ids: List[str], user: dict = Depends(get_current_user)):
    object_ids = [ObjectId(id) for id in ids]
    result = await email_records_collection.delete_many({
        "user_id": str(user["_id"]),
        "_id": {"$in": object_ids}
    })
    return {"deleted": result.deleted_count}

@router.delete("/emails/clear")
async def clear_emails(user: dict = Depends(get_current_user)):
    result = await email_records_collection.delete_many({"user_id": str(user["_id"])})
    return {"deleted": result.deleted_count} 