from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .user import Base

class EmailRecord(Base):
    __tablename__ = 'email_records'
    id = Column(Integer, primary_key=True, index=True)
    recipient = Column(String, nullable=False)
    status = Column(String, nullable=False, default='pending')
    error = Column(Text, nullable=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    subject = Column(String, nullable=False)
    body = Column(Text, nullable=False)
    user_id = Column(Integer, ForeignKey('users.id'))
    user = relationship('User') 