from fastapi import APIRouter, Depends
from Backend.schemas import InputData

import numpy as np
router = APIRouter()
import joblib
from pathlib import Path

model_path = Path(__file__).resolve().parent.parent / "Ml_models" / "trained_model.joblib"
with model_path.open("rb") as f:
    model=joblib.load(f)
if model:
    print("model loaded succesfully")

@router.post("/ai-prediction")
def predict(data: InputData):
    # Convert input to numpy array
    features = np.array([[
        data.Rainfall_mm,
        data.Slope_Angle,
        data.Soil_Saturation,
        data.Vegetation_Cover,
        data.Earthquake_Activity,
        data.Proximity_to_Water,
        data.Soil_Type_Gravel,
        data.Soil_Type_Sand,
        data.Soil_Type_Silt
    ]])
    try:
        prediction = model.predict(features)
        prob=float(np.max(model.predict_proba(features)[0]))
    except Exception as e:
        return {"output":False,"prediction":"there was an error please try some times letter"}
    else:
        return {"success":True,"prediction": int(prediction[0]),"probability":prob }
