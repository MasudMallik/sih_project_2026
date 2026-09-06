from fastapi import APIRouter, Depends, Header
from fastapi.security import OAuth2PasswordBearer
from Backend.token_create import decode_token
from Backend.ai_prediction import predict
from Backend.schemas import InputData

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

    # Telemetry data for live ML inference
    telemetry = InputData(
        Rainfall_mm=124.5,
        Slope_Angle=32.0,
        Soil_Saturation=82.0,
        Vegetation_Cover=35.0,
        Earthquake_Activity=2.8,
        Proximity_to_Water=140.0,
        Soil_Type_Gravel=0,
        Soil_Type_Sand=1,
        Soil_Type_Silt=0
    )
    
    ml_out = predict(telemetry)
    prob = ml_out.get("probability", 75.0)

    if prob >= 80:
        current_level = "critical"
        msg = "Critical hazard alert — immediate caution advised"
    elif prob >= 60:
        current_level = "high"
        msg = "Elevated landslide risk — slope alert active"
    elif prob >= 40:
        current_level = "moderate"
        msg = "Moderate risk — stay alert during rainfall"
    else:
        current_level = "low"
        msg = "Normal conditions in monitored sectors"

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
            "currentLevel": current_level,
            "message": msg,
            "zoneCount": 4,
            "counts": [
                { "level": "critical", "label": "Critical", "count": 1 },
                { "level": "high", "label": "High", "count": 2 },
                { "level": "moderate", "label": "Moderate", "count": 1 },
                { "level": "low", "label": "Low", "count": 0 }
            ],
            "zones": [
                {
                    "id": "Z1",
                    "level": "critical",
                    "label": "CRITICAL",
                    "name": "Rangpo NH10 Corridor",
                    "description": "Active debris accumulation on slope",
                    "distance": "4.2 km"
                },
                {
                    "id": "Z2",
                    "level": "high",
                    "label": "HIGH",
                    "name": "Teesta River Overflow Sector",
                    "description": "Rapid water level rise",
                    "distance": "8.5 km"
                },
                {
                    "id": "Z3",
                    "level": "high",
                    "label": "HIGH",
                    "name": "Chungthang Gorge Corridor",
                    "description": "Geotechnical slope destabilization",
                    "distance": "12.1 km"
                },
                {
                    "id": "Z4",
                    "level": "moderate",
                    "label": "MODERATE",
                    "name": "Melli Bridge Ridge",
                    "description": "Standard monitoring active",
                    "distance": "15.0 km"
                }
            ]
        },
        "weather": {
            "location": "Guwahati, Kamrup Metropolitan",
            "currentDay": "Today, Live Sensor Feed",
            "temperature": 24,
            "condition": "Heavy Rainfall",
            "conditionIcon": "🌧",
            "stats": {
                "rainfall": "124.5 mm",
                "humidity": "89%",
                "windGust": "24 km/h"
            },
            "stormAlert": "Rainfall warning active across Kamrup and East Sikkim districts",
            "forecast": [
                { "day": "Today", "icon": "🌧", "temps": "24° / 20°" },
                { "day": "Tomorrow", "icon": "🌦", "temps": "26° / 21°" },
                { "day": "Day 3", "icon": "⛅", "temps": "28° / 22°" }
            ]
        },
        "disasterTypes": [
            { "type": "Landslide", "icon": "⛰" },
            { "type": "Flood", "icon": "🌊" },
            { "type": "Fire", "icon": "🔥" },
            { "type": "Accident", "icon": "🚗" }
        ],
        "lastSyncTime": "Just now",
        "lastSyncMinutesAgo": 1
    }

@dashboard_router.get("/profile")
def dashboard_profile(current_user: dict = Depends(get_current_user)):
    return {
        "profile": {
            "email": current_user.get("email"),
            "full_name": current_user.get("full_name", "N/A")
        }
    }
