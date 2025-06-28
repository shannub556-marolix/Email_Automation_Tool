from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime

class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: str
    email: EmailStr
    created_at: Optional[datetime] = None

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    email: Optional[str] = None

class SMTPValidateRequest(BaseModel):
    smtp_email: EmailStr
    smtp_password: str

class EmailRecordCreate(BaseModel):
    recipient: EmailStr
    subject: str
    body: str

class EmailRecordOut(BaseModel):
    id: str
    recipient: str
    status: str
    error: Optional[str]
    timestamp: datetime
    subject: str
    body: str
    user_id: str

class EmailLogResponse(BaseModel):
    totalCount: int
    emails: List[EmailRecordOut]
    page: int
    totalPages: int 