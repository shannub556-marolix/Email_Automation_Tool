import os
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv('SECRET_KEY', 'your-secret-key-change-this-in-production')
SMTP_HOST = os.getenv('SMTP_HOST', 'smtp.gmail.com')
SMTP_PORT = int(os.getenv('SMTP_PORT', 587))
# MongoDB Atlas connection string - make sure to include database name
DB_URL = os.getenv('DB_URL', '')

DATABASE_NAME = os.getenv('DATABASE_NAME', 'email_automation') 