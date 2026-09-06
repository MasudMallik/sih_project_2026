from fastapi import APIRouter, Depends
from Backend.dashboardfile import get_current_user
from Backend.ai_prediction import predict
from Backend.schemas import InputData

router = APIRouter(prefix="/api/emergency-response", tags=["Emergency Response"])

@router.get("")
@router.get("/")
def emergency_response(current_user: dict = Depends(get_current_user)):
    # Run ML prediction on high-risk sector telemetry data
    sample_telemetry = InputData(
        Rainfall_mm=142.5,
        Slope_Angle=42.0,
        Soil_Saturation=88.0,
        Vegetation_Cover=25.0,
        Earthquake_Activity=3.2,
        Proximity_to_Water=120.0,
        Soil_Type_Gravel=0,
        Soil_Type_Sand=1,
        Soil_Type_Silt=0
    )
    
    ml_result = predict(sample_telemetry)
    ml_prob = ml_result.get("probability", 85.0)

    # Dynamic severity determination
    if ml_prob >= 80:
        severity_label = "Critical"
    elif ml_prob >= 50:
        severity_label = "High"
    else:
        severity_label = "Moderate"

    return {
        "incidents": [
            {
                "id": "INC-001",
                "name": "Rangpo NH10 Landslide Corridor",
                "location": "NH10 near Rangpo, East Sikkim",
                "severity": min(100, int(ml_prob)),
                "severityLabel": severity_label,
                "status": "Active",
                "detail": f"ML Risk Model probability: {ml_prob}%. Heavy debris accumulation on highway lane 2.",
                "updatedAt": "10 minutes ago"
            },
            {
                "id": "INC-002",
                "name": "Teesta River Overflow Sector B",
                "location": "Teesta River Bank, Melli",
                "severity": 72,
                "severityLabel": "High",
                "status": "Active",
                "detail": "Water levels rose by 1.8m in past 3 hours. Rapid alert active.",
                "updatedAt": "25 minutes ago"
            },
            {
                "id": "INC-003",
                "name": "Chungthang Slope Stabilization",
                "location": "Chungthang Valley, North Sikkim",
                "severity": 45,
                "severityLabel": "Moderate",
                "status": "Monitoring",
                "detail": "Geotechnical sensors monitoring minor rock movement.",
                "updatedAt": "1 hour ago"
            }
        ],
        "infrastructure": [
            {
                "id": "INF-01",
                "name": "Rangpo Relief Shelter",
                "location": "East Sikkim",
                "status": "Operational",
                "statusDetail": "Capacity 400 persons, currently 120 occupied"
            },
            {
                "id": "INF-02",
                "name": "Melli Bridge Inspection Post",
                "location": "South Sikkim Border",
                "status": "Operational",
                "statusDetail": "Structural integrity verified safe by monitoring team"
            },
            {
                "id": "INF-03",
                "name": "Singtam Primary Care Center",
                "location": "Singtam Highway",
                "status": "Compromised",
                "statusDetail": "Access road partially blocked; standby ambulance rerouted"
            }
        ],
        "villages": [
            {
                "id": "VIL-01",
                "name": "Chungthang",
                "distance": "4.2 km",
                "affected": 420,
                "capacity": 800,
                "needs": ["Rations", "Medical Support", "Temporary Tents"],
                "progress": 65
            },
            {
                "id": "VIL-02",
                "name": "Lachen Valley",
                "distance": "12.8 km",
                "affected": 180,
                "capacity": 500,
                "needs": ["Water Purification", "Blankets"],
                "progress": 40
            }
        ],
        "helpEntries": [
            {
                "id": "HELP-01",
                "category": "Rescue",
                "title": "NDRF Battalion 12 Quick Response",
                "contact": "+91-9876543210",
                "availability": "Deployed - Active Rescue",
                "location": "Gangtok Base",
                "distance": "4.5 km"
            },
            {
                "id": "HELP-02",
                "category": "Medical",
                "title": "Sikkim State Emergency Health Unit",
                "contact": "+91-9876543211",
                "availability": "On Standby - 2 Ambulances",
                "location": "Singtam Outpost",
                "distance": "8.2 km"
            },
            {
                "id": "HELP-03",
                "category": "Shelter",
                "title": "Rangpo District Relief Center",
                "contact": "+91-9876543212",
                "availability": "280 Beds Available",
                "location": "Rangpo Stadium Complex",
                "distance": "3.1 km"
            }
        ],
        "resources": [
            { "id": "RES-01", "name": "Rescue Boats", "allocated": 14, "total": 20, "unit": "units" },
            { "id": "RES-02", "name": "Medical Trauma Kits", "allocated": 150, "total": 200, "unit": "kits" },
            { "id": "RES-03", "name": "Emergency Ration Packs", "allocated": 1200, "total": 1500, "unit": "packs" }
        ],
        "feed": [
            {
                "id": "FEED-01",
                "time": "12:45 PM",
                "text": "Heavy rainfall warning issued for Kamrup and East Sikkim districts. ML models indicate elevated landslide risk.",
                "type": "alert"
            },
            {
                "id": "FEED-02",
                "time": "12:10 PM",
                "text": "NDRF Quick Response Team deployed to Rangpo landslide zone.",
                "type": "dispatch"
            },
            {
                "id": "FEED-03",
                "time": "11:30 AM",
                "text": "System sync complete. Sensor network reporting normal telemetry from Teesta stations.",
                "type": "system"
            }
        ]
    }
