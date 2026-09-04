import joblib
with open(r"..\Ml_models\trained_model.joblib","rb") as f:  
    model=joblib.load(f)
if model:
    print("model loaded")