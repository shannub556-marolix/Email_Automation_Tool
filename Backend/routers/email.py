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
    if not file.filename.endswith('.xlsx'):
        raise HTTPException(status_code=400, detail="Only .xlsx files are allowed")
    if not validate_smtp_login(smtp_email, smtp_password, SMTP_HOST, SMTP_PORT):
        raise HTTPException(status_code=401, detail="Invalid SMTP credentials")
    
    content = file.file.read()
    df = pd.read_excel(io.BytesIO(content))
    if 'email' not in df.columns:
        raise HTTPException(status_code=400, detail="Excel must have an 'email' column")
    
    # Email validation regex
    email_pattern = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
    
    records = []
    invalid_emails = []
    
    for _, row in df.iterrows():
        recipient = str(row['email']).strip()
        
        # Validate email format
        if not email_pattern.match(recipient):
            invalid_emails.append(recipient)
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
            "timestamp": datetime.utcnow()
        }
        
        result = await email_records_collection.insert_one(record_data)
        record_data["id"] = str(result.inserted_id)
        records.append(record_data)
    
    # Add background tasks for sending emails
    for record in records:
        background_tasks.add_task(send_email_task, record["id"], smtp_email, smtp_password)
    
    message = f"{len(records)} emails queued for sending."
    if invalid_emails:
        message += f" {len(invalid_emails)} invalid emails were skipped: {', '.join(invalid_emails[:5])}"
        if len(invalid_emails) > 5:
            message += f" and {len(invalid_emails) - 5} more..."
    
    return {"message": message}

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
        server.sendmail(smtp_email, [record["recipient"]], msg.as_string())
        server.quit()
        
        await email_records_collection.update_one(
            {"_id": ObjectId(record_id)},
            {"$set": {"status": "sent", "error": None}}
        )
    except Exception as e:
        await email_records_collection.update_one(
            {"_id": ObjectId(record_id)},
            {"$set": {"status": "failed", "error": str(e)}}
        )

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