from fastapi import APIRouter, Depends
from Backend.dashboardfile import get_current_user

router = APIRouter(tags=["Risk Map"])

@router.get("/risk-map")
@router.get("/api/risk-map")
def risk_map(current_user: dict = Depends(get_current_user)):
    risks = [
        {
            "id": "ZONE-01",
            "name": "Teesta River Basin Zone A",
            "type": "Landslide Hazard Zone",
            "district": "East Sikkim",
            "center": { "lat": 27.17, "lng": 88.50 },
            "riskLevel": "High",
            "riskScore": 82,
            "rainfall24h": 112.4,
            "soilMoisture": 84,
            "slope": 35.5,
            "prevLandslides": 3,
            "aiProbability": 87.5,
            "recommendedAction": "Monitor slope indicators and restrict heavy vehicle transit",
            "lastIncident": "Landslide reported 2 weeks ago"
        },
        {
            "id": "ZONE-02",
            "name": "Rangpo Valley Sector",
            "type": "Flood Prone Sector",
            "district": "Kamrup",
            "center": { "lat": 26.14, "lng": 91.73 },
            "riskLevel": "Medium",
            "riskScore": 58,
            "rainfall24h": 64.0,
            "soilMoisture": 72,
            "slope": 18.2,
            "prevLandslides": 1,
            "aiProbability": 54.0,
            "recommendedAction": "Clear local drainage channels and issue standard alert",
            "lastIncident": "Minor inundation last month"
        },
        {
            "id": "ZONE-03",
            "name": "Chungthang Gorge Sector",
            "type": "Critical Slope Corridor",
            "district": "North Sikkim",
            "center": { "lat": 27.60, "lng": 88.65 },
            "riskLevel": "Critical",
            "riskScore": 94,
            "rainfall24h": 145.2,
            "soilMoisture": 91,
            "slope": 48.0,
            "prevLandslides": 7,
            "aiProbability": 96.2,
            "recommendedAction": "Immediate evacuation warning active",
            "lastIncident": "Major rockfall yesterday"
        }
    ]

    return {
        "success": True,
        "count": len(risks),
        "risks": risks
    }

