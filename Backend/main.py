from fastapi import FastAPI,APIRouter,Depends,Form,Request,HTTPException,Response
from fastapi.security import OAuth2PasswordBearer
from security import check_hash,create_hash
from token_create import craete_token,decode_token
from schemas import register,login
from pymongo import MongoClient
from dotenv import load_dotenv
from fastapi.responses import JSONResponse
import os
load_dotenv()
client=MongoClient(os.getenv("mongodb_url"))
database=client.get_database("user")
collection=database["users"]

app=FastAPI()

@app.get("/")
def home_page(request:Request):
    return {"request":"welcome"}

@app.post("/login")
def login_page(user:login):
    password=user.password
    check=collection.find_one({"email":user.email})
    if not check:
        return
    else:
        try:
            if check_hash(password,check["password"]):
                token=craete_token(user.email)
                return {"login":True,"token":token,"email":user.email}
            else:
                return {"login":False,"Error":"password miss match"}
        except Exception as e:
            return False

@app.post("/register")
def register_user(user: register):
    if collection.find_one({"email": user.email}):
        raise HTTPException(status_code=400, detail="Email already registered")

    if user.password != user.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")

    hashed_pw = create_hash(user.password)

    new_user = {
        "full_name": user.full_name,
        "email": user.email,
        "contact": user.contact,
        "location": {"latitude": user.latitude, "longitude": user.longitude},
        "password": hashed_pw
    }
    collection.insert_one(new_user)

    token = craete_token({"email": user.email})

    return {
        "register": True,  
         "token": token,
        "email": user.email,
        "full_name": user.full_name
    }



@app.post("/logout")
def logout(response: Response):
    
    response.delete_cookie("access_token")
    return JSONResponse(content={"logout": True, "message": "Logged out successfully"})
