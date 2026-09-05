from fastapi import APIRouter, Depends
from dashboardfile import get_current_user
from schemas import PredictionRequest
router = APIRouter()
def predict_risk(
    temperature,
    rainfall,
    humidity,
    wind_speed
):
    score = 0

    # Rainfall
    if rainfall >= 200:
        score += 40

    elif rainfall >= 100:
        score += 25

    elif rainfall >= 50:
        score += 15


    # Temperature
    if temperature >= 40:
        score += 20

    elif temperature >= 35:
        score += 10


    # Humidity
    if humidity >= 80:
        score += 15

    elif humidity >= 60:
        score += 10


    # Wind speed
    if wind_speed >= 60:
        score += 25

    elif wind_speed >= 40:
        score += 15


    score = min(score, 100)


    if score >= 70:
        risk_level = "High"

    elif score >= 40:
        risk_level = "Medium"

    else:
        risk_level = "Low"


    return {
        "risk_score": score,
        "risk_level": risk_level
    }


@router.post("/ai-prediction")
def ai_prediction(
    data: PredictionRequest,
    current_user=Depends(get_current_user)
):

    prediction = predict_risk(
        data.temperature,
        data.rainfall,
        data.humidity,
        data.wind_speed
    )

    return {
        "success": True,
        "prediction": prediction
    }
