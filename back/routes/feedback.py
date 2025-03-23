from fastapi import APIRouter, HTTPException, Depends
from app.database import get_db_connection
from app.auth import hash_password, verify_password, create_access_token
from app.schemas import UserCreate, UserLogin
import mysql.connector

router = APIRouter()

@router.post("/register")
def register_user(user: UserCreate):
    db = get_db_connection()
    cursor = db.cursor()

    cursor.execute("SELECT * FROM users WHERE email = %s", (user.email,))
    if cursor.fetchone():
        raise HTTPException(status_code=400, detail="Email already exists")

    hashed_password = hash_password(user.password)
    cursor.execute("INSERT INTO users (name, email, password, role) VALUES (%s, %s, %s, %s)",
                   (user.name, user.email, hashed_password, user.role))
    db.commit()
    return {"message": "User registered successfully"}

@router.post("/login")
def login(user: UserLogin):
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)

    cursor.execute("SELECT * FROM users WHERE email = %s", (user.email,))
    db_user = cursor.fetchone()

    if not db_user or not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({"sub": db_user["email"]})
    return {"access_token": token, "token_type": "bearer"}
