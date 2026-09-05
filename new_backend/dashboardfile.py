@app.get("/dashboard")
def dashboard(current_user=Depends(get_current_user)):

    return {
        "success": True,
        "message": "Dashboard data fetched successfully",
        "user": {
            "full_name": current_user.get("full_name"),
            "email": current_user.get("email"),
            "contact": current_user.get("contact"),
            "location": current_user.get("location")
        }
    }
