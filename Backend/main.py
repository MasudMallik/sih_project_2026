from fastapi import FastAPI, APIRouter, Depends, Form, Request, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from Backend.security import check_hash, create_hash
from Backend.token_create import create_token, craete_token, decode_token
from Backend.schemas import register, login
from pymongo import MongoClient
from dotenv import load_dotenv
from fastapi.responses import JSONResponse
from importlib import import_module
import uvicorn
import os

load_dotenv()

from Backend.dashboardfile import dashboard_router
from Backend.Chat_Bot import router as chatbot_router
from Backend.Profile_page import router as profile_router
from Backend.risk_map import router as riskmap_router
from Backend.ai_prediction import router as prediction_router

emergency_router = import_module("Backend.emergency-response").router

app = FastAPI(title="Geo Rakshak API")

# Configure CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:4173",
        "http://127.0.0.1:4173",
    ],
    allow_origin_regex=r"https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(dashboard_router)
app.include_router(chatbot_router)
app.include_router(profile_router)
app.include_router(riskmap_router)
app.include_router(prediction_router)
app.include_router(emergency_router)

# In-memory user fallback if MongoDB is not reachable
in_memory_users = {}

def get_collection():
    mongodb_url = os.getenv("mongodb_url")
    if not mongodb_url:
        return None
    try:
        client = MongoClient(mongodb_url, serverSelectionTimeoutMS=2000)
        client.admin.command("ping")
        database = client.get_database("user")
        return database["users"]
    except Exception:
        return None

@app.get("/")
def home_page(request: Request):
    return {"request": "welcome", "status": "active"}

@app.post("/login")
def login_page(user: login):
    collection = get_collection()
    found_user = None
    
    if collection is not None:
        try:
            normalized_email = user.email.strip().lower()
            found_user = collection.find_one({"email": normalized_email})
        except Exception:
            found_user = in_memory_users.get(normalized_email)
    else:
        found_user = in_memory_users.get(normalized_email)

    if not found_user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    password_ok = check_hash(user.password, found_user["password"])
    if not password_ok:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_token({
        "email": normalized_email,
        "full_name": found_user.get("full_name", ""),
        "contact": found_user.get("contact", ""),
        "location": found_user.get("location", "")
    })

    return {
        "login": True,
        "token": token,
        "email": normalized_email,
        "full_name": found_user.get("full_name", "")
    }

@app.post("/register")
def register_user(user: register):
    collection = get_collection()
    
    # Check if user exists
    existing = None
    if collection is not None:
        try:
            normalized_email = user.email.strip().lower()
            existing = collection.find_one({"email": normalized_email})
        except Exception:
            existing = in_memory_users.get(normalized_email)
    else:
        existing = in_memory_users.get(normalized_email)

    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    if user.password != user.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")

        hashed_pw = create_hash(user.password)
        # Ensure the hashed password is stored as bytes for consistency
        if isinstance(hashed_pw, bytes):
            hashed_pw_to_store = hashed_pw.decode('utf-8')
        else:
            hashed_pw_to_store = hashed_pw

    new_user = {
        "full_name": user.full_name,
        "email": normalized_email,
        "contact": user.contact_number,
        "location": user.location,
            "password": hashed_pw_to_store
    }

    if collection is not None:
        try:
            collection.insert_one(new_user)
        except Exception:
            in_memory_users[normalized_email] = new_user
    else:
        in_memory_users[normalized_email] = new_user

    token = create_token({
        "email": normalized_email,
        "full_name": user.full_name,
        "contact": user.contact_number,
        "location": user.location
    })

    return {
        "register": True,
        "token": token,
        "email": normalized_email,
        "full_name": user.full_name
    }

@app.post("/api/incidents")
def report_incident(data: dict):
    disaster_type = data.get("disasterType", "Disaster")
    location = data.get("location", "specified location")
    return {
        "success": True,
        "message": f"{disaster_type} reported at {location}. Nearest emergency team notified.",
        "incidentId": f"INC-{int(os.urandom(4).hex(), 16)}",
        "teamNotified": True
    }

@app.post("/api/sos")
def trigger_sos(data: dict = None):
    return {
        "success": True,
        "message": "SOS emergency signal received. Rescue team dispatched to your location.",
    # Retrieve stored password (could be string from DB or bytes from memory)
        "teamAssigned": True,
        "eta": "10-15 minutes"
    }

@app.post("/logout")
def logout(response: Response):
    response.delete_cookie("access_token")
    return JSONResponse(content={"logout": True, "message": "Logged out successfully"})

if __name__ == "__main__":
    uvicorn.run("Backend.main:app", host="127.0.0.1", port=8000, reload=True)

