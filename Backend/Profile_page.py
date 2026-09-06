from fastapi import APIRouter, Depends
from Backend.dashboardfile import get_current_user
router = APIRouter(tags=["Profile"])

@router.get("/profile")
@router.get("/api/profile")
def profile(
    current_user=Depends(get_current_user)
):
    return {
        "success": True,
        "profile": {
            "full_name": current_user.get("full_name", "Citizen"),
            "email": current_user.get("email", ""),
            "contact": current_user.get("contact", ""),
            "location": current_user.get("location", "")
        }
    }

