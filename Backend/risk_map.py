from fastapi import APIRouter, Depends
from pymongo import MongoClient
from dotenv import load_dotenv
from Backend.dashboardfile import get_current_user
import os


load_dotenv()


client = MongoClient(
    os.getenv("mongodb_url")
)

database = client.get_database("user")

risk_collection = database["risk_data"]


router = APIRouter()


@router.get("/risk-map")
def risk_map(
    current_user=Depends(get_current_user)
):

    risks = list(
        risk_collection.find(
            {},
            {"_id": 0}
        )
    )

    return {
        "success": True,
        "count": len(risks),
        "risks": risks
    }
