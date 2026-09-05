@app.get("/emergency-response")
def emergency_response(current_user=Depends(get_current_user)):

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
