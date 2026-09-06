from fastapi import APIRouter, Depends, HTTPException, Header
from fastapi.security import OAuth2PasswordBearer
from Backend.token_create import decode_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login", auto_error=False)

dashboard_router = APIRouter(
    prefix="/api/dashboard",
    tags=["Dashboard"],
)

def get_current_user(token: str = Depends(oauth2_scheme), authorization: str = Header(None)):
    actual_token = token
    if not actual_token and authorization and authorization.startswith("Bearer "):
        actual_token = authorization.split(" ")[1]
    
    if not actual_token:
        # Fallback payload if token is missing so frontend dev remains functional
        return {"email": "guest@georakshak.org", "full_name": "Citizen User"}

    payload = decode_token(actual_token)
    if not payload:
        return {"email": "guest@georakshak.org", "full_name": "Citizen User"}
    return payload

@dashboard_router.get("")
@dashboard_router.get("/")
def dashboard_home(current_user: dict = Depends(get_current_user)):
    user_name = current_user.get("full_name") or current_user.get("email", "Citizen").split("@")[0].capitalize()
    user_email = current_user.get("email", "user@georakshak.org")
    
    name_parts = [p for p in user_name.split() if p]
    if len(name_parts) >= 2:
        initials = (name_parts[0][0] + name_parts[-1][0]).upper()
    elif len(name_parts) == 1:
        initials = name_parts[0][:2].upper()
    else:
        initials = "GR"

    return {
        "user": {
            "id": user_email,
            "name": user_name,
            "role": "Citizen",
            "avatar": initials
        },
        "location": {
            "name": "Guwahati",
            "region": "Kamrup Metropolitan, Assam"
        },
        "risk": {
            "level": "Moderate",
            "score": 64,
            "activeAlertsCount": 3,
            "primaryFactors": ["Heavy Rainfall", "Steep Slope", "High Soil Saturation"],
            "trends": [
              { "time": "00:00", "score": 45 },
              { "time": "04:00", "score": 52 },
              { "time": "08:00", "score": 64 },
              { "time": "12:00", "score": 60 },
              { "time": "16:00", "score": 55 },
              { "time": "20:00", "score": 48 }
            ]
        },
        "weather": {
            "rainfall24h": 84.5,
            "soilMoisture": 78,
            "tempCelsius": 24.2,
            "humidityPercent": 89
        },
        "disasterTypes": ["Landslide", "Flash Flood", "River Bank Erosion", "Earthquake"],
        "lastSyncMinutesAgo": 2
    }

@dashboard_router.get("/profile")
def dashboard_profile(current_user: dict = Depends(get_current_user)):
    return {
        "profile": {
            "email": current_user.get("email"),
            "full_name": current_user.get("full_name", "N/A")
        }
    }

