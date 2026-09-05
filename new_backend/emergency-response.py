from fastapi import APIRouter, Depends
from pymongo import MongoClient
from dotenv import load_dotenv
from dashboardfile import get_current_user
import os


load_dotenv()


client = MongoClient(
    os.getenv("mongodb_url")
)

database = client.get_database("user")

emergency_collection = database[
    "emergency_response"
]


router = APIRouter()


@router.get("/emergency-response")
def emergency_response(
    current_user=Depends(get_current_user)
):

    emergencies = list(
        emergency_collection.find(
            {},
            {"_id": 0}
        )
    )

    return {
        "success": True,
        "count": len(emergencies),
        "emergencies": emergencies
    }
