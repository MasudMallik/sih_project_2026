from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from Backend.token_create import decode_token

# OAuth2 scheme for token extraction
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

dashboard_router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"],
)

# Dependency to verify token
def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = decode_token(token)
        return payload
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")

# Example protected route
@dashboard_router.get("/")
def dashboard_home(current_user: dict = Depends(get_current_user)):
    return {
        "message": "Welcome to your dashboard",
        "user": current_user
    }

@dashboard_router.get("/profile")
def dashboard_profile(current_user: dict = Depends(get_current_user)):
    return {
        "profile": {
            "email": current_user.get("email"),
            "full_name": current_user.get("full_name", "N/A")
        }
    }
