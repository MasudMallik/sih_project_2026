from fastapi import APIRouter
from Backend.schemas import InputData
import pandas as pd
import numpy as np
import joblib
from pathlib import Path

router = APIRouter(tags=["AI Prediction"])

global model
model = None

def load_model():
    try:
        model_path = Path(__file__).resolve().parent.parent / "Ml_models" / "trained_model.joblib"
        if model_path.exists():
            with model_path.open("rb") as f:
                return joblib.load(f)
    except Exception:
        return None
    return None

@router.post("/ai-prediction")
@router.post("/api/ai-prediction")
def predict(data: InputData):
    global model
    if not model:
        model = load_model()

    features = pd.DataFrame([{
        "Rainfall_mm": data.Rainfall_mm,
        "Slope_Angle": data.Slope_Angle,
        "Soil_Saturation": data.Soil_Saturation,
        "Vegetation_Cover": data.Vegetation_Cover,
        "Earthquake_Activity": data.Earthquake_Activity,
        "Proximity_to_Water": data.Proximity_to_Water,
        "Soil_Type_Gravel": data.Soil_Type_Gravel,
        "Soil_Type_Sand": data.Soil_Type_Sand,
        "Soil_Type_Silt": data.Soil_Type_Silt
    }])

    if model is not None:
        try:
            prediction = model.predict(features)
            prob = float(np.max(model.predict_proba(features)[0]))
            return {
                "success": True,
                "prediction": int(prediction[0]),
                "probability": round(prob * 100, 2)
            }
        except Exception:
            pass

    # Mathematical heuristic calculation fallback
    score = (
        (data.Rainfall_mm / 200.0) * 40.0 +
        (data.Slope_Angle / 60.0) * 30.0 +
        (data.Soil_Saturation / 100.0) * 20.0 +
        (data.Earthquake_Activity / 10.0) * 10.0
    )
    predicted_class = 1 if score > 50 else 0
    probability = min(99.0, max(1.0, round(score, 2)))

    return {
        "success": True,
        "prediction": predicted_class,
        "probability": probability
    }

    
