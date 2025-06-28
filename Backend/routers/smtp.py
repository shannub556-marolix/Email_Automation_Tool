from fastapi import APIRouter, HTTPException, status, Body
from schemas import SMTPValidateRequest
from utils import validate_smtp_login
from config import SMTP_HOST, SMTP_PORT

router = APIRouter(prefix="/smtp", tags=["smtp"])

@router.post("/validate")
def validate_smtp(data: SMTPValidateRequest):
    if validate_smtp_login(data.smtp_email, data.smtp_password, SMTP_HOST, SMTP_PORT):
        return {"message": "SMTP connected"}
    raise HTTPException(status_code=401, detail="Invalid email or password") 