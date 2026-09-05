@app.get("/risk-map")
def risk_map(current_user=Depends(get_current_user)):

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
