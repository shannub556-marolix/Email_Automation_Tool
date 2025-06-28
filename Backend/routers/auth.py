from fastapi import APIRouter, Depends, HTTPException, status
from database import users_collection
from schemas import UserCreate, UserOut, Token
from utils import hash_password, verify_password, create_access_token
from fastapi.security import OAuth2PasswordRequestForm
from bson import ObjectId
from datetime import datetime

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=UserOut)
async def register(user: UserCreate):
    # Check if user already exists
    existing_user = await users_collection.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user
    hashed = hash_password(user.password)
    user_data = {
        "email": user.email,
        "password_hash": hashed,
        "created_at": datetime.utcnow()
    }
    
    result = await users_collection.insert_one(user_data)
    user_data["id"] = str(result.inserted_id)
    
    return UserOut(**user_data)

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await users_collection.find_one({"email": form_data.username})
    if not user or not verify_password(form_data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token = create_access_token({"sub": user["email"]})
    return {"access_token": access_token, "token_type": "bearer"} 