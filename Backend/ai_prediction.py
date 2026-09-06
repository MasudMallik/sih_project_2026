from fastapi import APIRouter, Depends
from Backend.schemas import InputData

import pandas as pd
import numpy as np
router = APIRouter()
import joblib
from pathlib import Path

global model
model=None


def load_model():
    model_path = Path(__file__).resolve().parent.parent / "Ml_models" / "trained_model.joblib"
    with model_path.open("rb") as f:
        model=joblib.load(f)
    if model:
        return model

@router.post("/ai-prediction")
def predict(data: InputData):
    global model
    if not model:
        model=load_model()
    # Build DataFrame with correct column names
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

    try:
        print("Input features:\n", features)
        print("Transformed features shape:", model.transform(features).shape if hasattr(model, "transform") else "no transform")
        print("Prediction:", model.predict(features))
        print("Probabilities:", model.predict_proba(features))

        prediction = model.predict(features)
        prob = float(np.max(model.predict_proba(features)[0]))
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "prediction": None
        }
    else:
        return {
            "success": True,
            "prediction": int(prediction[0]),
            "probability": prob*100
        }
    
