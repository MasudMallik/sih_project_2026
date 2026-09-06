from fastapi import APIRouter, Depends
from Backend.dashboardfile import get_current_user

router = APIRouter(prefix="/api/emergency-response", tags=["Emergency Response"])

@router.get("")
@router.get("/")
def emergency_response(current_user: dict = Depends(get_current_user)):
    return {
        "incidents": [
            {
                "id": "INC-001",
                "disasterType": "Landslide",
                "location": "NH10 near Rangpo",
                "severity": 4,
                "status": "Active",
                "timestamp": "2026-09-06T10:30:00Z",
                "description": "Debris block on highway lane 2"
            },
            {
                "id": "INC-002",
                "disasterType": "Flash Flood",
                "location": "Teesta River Bank, Melli",
                "severity": 5,
                "status": "In Progress",
                "timestamp": "2026-09-06T11:15:00Z",
                "description": "Water levels rose by 1.8m in past 3 hours"
            }
        ],
        "infrastructure": [
            {
                "id": "INF-01",
                "name": "Rangpo Relief Shelter",
                "status": "Operational",
                "location": "East Sikkim",
                "statusDetail": "Capacity 400 persons, currently 120 occupied"
            },
            {
                "id": "INF-02",
                "name": "Melli Bridge Inspection Post",
                "status": "Monitoring",
                "location": "South Sikkim Border",
                "statusDetail": "Structural integrity verified safe"
            }
        ],
        "villages": [
            {
                "id": "VIL-01",
                "name": "Chungthang",
                "riskLevel": "High",
                "population": 2400,
                "alertState": "Evacuation Warning"
            },
            {
                "id": "VIL-02",
                "name": "Lachen Valley",
                "riskLevel": "Moderate",
                "population": 1800,
                "alertState": "Standby"
            }
        ],
        "helpEntries": [
            {
                "id": "HELP-01",
                "teamName": "NDRF Battalion 12",
                "contact": "+91-9876543210",
                "distanceKm": 4.5,
                "location": "Gangtok Base"
            },
            {
                "id": "HELP-02",
                "teamName": "Sikkim State Disaster Force",
                "contact": "+91-9876543211",
                "distanceKm": 8.2,
                "location": "Singtam Outpost"
            }
        ],
        "resources": [
            { "type": "Rescue Boats", "available": 14, "total": 20 },
            { "type": "Medical Kits", "available": 150, "total": 200 },
            { "type": "Emergency Rations", "available": 1200, "total": 1500 }
        ],
        "feed": [
            {
                "id": "FEED-01",
                "timestamp": "12:45 PM",
                "message": "Heavy rainfall warning issued for Kamrup and East Sikkim districts."
            },
            {
                "id": "FEED-02",
                "timestamp": "12:10 PM",
                "message": "NDRF Quick Response Team deployed to Rangpo landslide zone."
            }
        ]
    }

