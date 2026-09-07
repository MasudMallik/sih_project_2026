from fastapi import APIRouter, Depends
from Backend.dashboardfile import get_current_user
import pandas as pd
import numpy as np
import joblib
from pathlib import Path

router = APIRouter(tags=["Risk Map"])

_model = None

def get_ml_model():
    global _model
    if _model is not None:
        return _model
    try:
        model_path = Path(__file__).resolve().parent.parent / "Ml_models" / "trained_model.joblib"
        if model_path.exists():
            with model_path.open("rb") as f:
                _model = joblib.load(f)
                return _model
    except Exception as e:
        print(f"Warning: Could not load trained ML model: {e}")
    return None

def compute_zone_ml_risk(telemetry: dict) -> dict:
    """
    Runs the live ML model on telemetry features:
    ['Rainfall_mm', 'Slope_Angle', 'Soil_Saturation', 'Vegetation_Cover',
     'Earthquake_Activity', 'Proximity_to_Water', 'Soil_Type_Gravel',
     'Soil_Type_Sand', 'Soil_Type_Silt']
    """
    model = get_ml_model()
    rainfall = float(telemetry.get("Rainfall_mm", 120.0))
    slope = float(telemetry.get("Slope_Angle", 45.0))
    soil_sat = float(telemetry.get("Soil_Saturation", 0.75))
    veg_cover = float(telemetry.get("Vegetation_Cover", 0.35))
    earthquake = float(telemetry.get("Earthquake_Activity", 2.5))
    prox_water = float(telemetry.get("Proximity_to_Water", 0.8))
    gravel = int(telemetry.get("Soil_Type_Gravel", 0))
    sand = int(telemetry.get("Soil_Type_Sand", 0))
    silt = int(telemetry.get("Soil_Type_Silt", 1))

    probability = 50.0
    predicted_class = 0

    if model is not None:
        try:
            features = pd.DataFrame([{
                "Rainfall_mm": rainfall,
                "Slope_Angle": slope,
                "Soil_Saturation": soil_sat if soil_sat <= 1.0 else soil_sat / 100.0,
                "Vegetation_Cover": veg_cover if veg_cover <= 1.0 else veg_cover / 100.0,
                "Earthquake_Activity": earthquake,
                "Proximity_to_Water": prox_water,
                "Soil_Type_Gravel": gravel,
                "Soil_Type_Sand": sand,
                "Soil_Type_Silt": silt
            }])
            pred = model.predict(features)
            predicted_class = int(pred[0])
            prob_arr = model.predict_proba(features)[0]
            # Class 1 is landslide risk
            probability = float(prob_arr[1] if len(prob_arr) > 1 else prob_arr[0]) * 100.0
        except Exception as e:
            # Fallback heuristic
            score = (
                (rainfall / 250.0) * 35.0 +
                (slope / 60.0) * 30.0 +
                (soil_sat * 20.0) +
                (earthquake / 7.0) * 15.0
            )
            probability = min(99.0, max(5.0, score))
            predicted_class = 1 if probability >= 60.0 else 0
    else:
        # Fallback heuristic
        score = (
            (rainfall / 250.0) * 35.0 +
            (slope / 60.0) * 30.0 +
            (soil_sat * 20.0) +
            (earthquake / 7.0) * 15.0
        )
        probability = min(99.0, max(5.0, score))
        predicted_class = 1 if probability >= 60.0 else 0

    probability = round(probability, 1)
    risk_score = int(round(probability))

    if probability >= 80:
        level = "Critical"
        action = "Immediate slope stabilization alert and evacuation advisory for low-lying settlements."
    elif probability >= 60:
        level = "High"
        action = "Continuous pore-pressure monitoring active. Restrict heavy transit on vulnerable bends."
    elif probability >= 35:
        level = "Medium"
        action = "Standard precautionary alert. Clear stormwater culverts and maintain sensor sync."
    else:
        level = "Low"
        action = "Normal environmental parameters. Periodic sensor sweep routine active."

    return {
        "riskLevel": level,
        "riskScore": risk_score,
        "aiProbability": probability,
        "predictedClass": predicted_class,
        "recommendedAction": action
    }

# Monitored Sector Configurations with Geographical coordinates and live telemetry
MONITORED_ZONES_CONFIG = [
    {
        "id": "ZONE-01",
        "name": "Teesta River Basin — Corridor A",
        "type": "Landslide & Inundation Sector",
        "district": "East Sikkim",
        "center": { "lat": 27.24, "lng": 88.52 },
        "prevLandslides": 4,
        "lastIncident": "Rockfall and mudslide 10 days ago",
        "geometry": {
            "type": "Polygon",
            "coordinates": [[
                [88.48, 27.20],
                [88.56, 27.20],
                [88.58, 27.27],
                [88.50, 27.28],
                [88.48, 27.20]
            ]]
        },
        "telemetry": {
            "Rainfall_mm": 210.5,
            "Slope_Angle": 56.0,
            "Soil_Saturation": 0.88,
            "Vegetation_Cover": 0.22,
            "Earthquake_Activity": 4.2,
            "Proximity_to_Water": 0.25,
            "Soil_Type_Gravel": 0,
            "Soil_Type_Sand": 0,
            "Soil_Type_Silt": 1
        }
    },
    {
        "id": "ZONE-02",
        "name": "Rangpo Valley & NH-10 Choke Point",
        "type": "Critical Slope Corridor",
        "district": "Pakyong / East Sikkim",
        "center": { "lat": 27.18, "lng": 88.53 },
        "prevLandslides": 6,
        "lastIncident": "Major debris obstruction on highway yesterday",
        "geometry": {
            "type": "Polygon",
            "coordinates": [[
                [88.49, 27.14],
                [88.56, 27.14],
                [88.57, 27.21],
                [88.51, 27.22],
                [88.49, 27.14]
            ]]
        },
        "telemetry": {
            "Rainfall_mm": 245.0,
            "Slope_Angle": 58.5,
            "Soil_Saturation": 0.94,
            "Vegetation_Cover": 0.15,
            "Earthquake_Activity": 5.1,
            "Proximity_to_Water": 0.18,
            "Soil_Type_Gravel": 0,
            "Soil_Type_Sand": 0,
            "Soil_Type_Silt": 1
        }
    },
    {
        "id": "ZONE-03",
        "name": "Chungthang Gorge Hydro Corridor",
        "type": "High Vulnerability Gorge",
        "district": "North Sikkim",
        "center": { "lat": 27.61, "lng": 88.64 },
        "prevLandslides": 8,
        "lastIncident": "Flash slope destabilization reported",
        "geometry": {
            "type": "Polygon",
            "coordinates": [[
                [88.59, 27.56],
                [88.68, 27.57],
                [88.70, 27.65],
                [88.61, 27.66],
                [88.59, 27.56]
            ]]
        },
        "telemetry": {
            "Rainfall_mm": 280.0,
            "Slope_Angle": 59.0,
            "Soil_Saturation": 0.96,
            "Vegetation_Cover": 0.10,
            "Earthquake_Activity": 5.8,
            "Proximity_to_Water": 0.12,
            "Soil_Type_Gravel": 0,
            "Soil_Type_Sand": 0,
            "Soil_Type_Silt": 1
        }
    },
    {
        "id": "ZONE-04",
        "name": "Melli Ridge & Confluence Point",
        "type": "Slope Destabilization Watch",
        "district": "South Sikkim",
        "center": { "lat": 27.08, "lng": 88.45 },
        "prevLandslides": 2,
        "lastIncident": "Minor gravel slippage last week",
        "geometry": {
            "type": "Polygon",
            "coordinates": [[
                [88.40, 27.04],
                [88.49, 27.04],
                [88.50, 27.12],
                [88.42, 27.12],
                [88.40, 27.04]
            ]]
        },
        "telemetry": {
            "Rainfall_mm": 135.0,
            "Slope_Angle": 42.0,
            "Soil_Saturation": 0.65,
            "Vegetation_Cover": 0.48,
            "Earthquake_Activity": 2.2,
            "Proximity_to_Water": 0.60,
            "Soil_Type_Gravel": 0,
            "Soil_Type_Sand": 1,
            "Soil_Type_Silt": 0
        }
    },
    {
        "id": "ZONE-05",
        "name": "Kamrup Foothills & Brahmaputra Drainage",
        "type": "Rainfall Inundation & Edge Failure",
        "district": "Kamrup Metropolitan, Assam",
        "center": { "lat": 26.15, "lng": 91.75 },
        "prevLandslides": 1,
        "lastIncident": "Waterlogging cleared 4 days ago",
        "geometry": {
            "type": "Polygon",
            "coordinates": [[
                [91.68, 26.09],
                [91.82, 26.10],
                [91.83, 26.20],
                [91.69, 26.19],
                [91.68, 26.09]
            ]]
        },
        "telemetry": {
            "Rainfall_mm": 85.0,
            "Slope_Angle": 22.0,
            "Soil_Saturation": 0.52,
            "Vegetation_Cover": 0.68,
            "Earthquake_Activity": 1.4,
            "Proximity_to_Water": 0.40,
            "Soil_Type_Gravel": 1,
            "Soil_Type_Sand": 0,
            "Soil_Type_Silt": 0
        }
    },
    {
        "id": "ZONE-06",
        "name": "Chamoli Alaknanda Catchment",
        "type": "High Altitude Glacial & Slope Zone",
        "district": "Chamoli, Uttarakhand",
        "center": { "lat": 30.41, "lng": 79.33 },
        "prevLandslides": 5,
        "lastIncident": "Mudflow event triggered by rainfall",
        "geometry": {
            "type": "Polygon",
            "coordinates": [[
                [79.25, 30.34],
                [79.40, 30.35],
                [79.42, 30.46],
                [79.26, 30.45],
                [79.25, 30.34]
            ]]
        },
        "telemetry": {
            "Rainfall_mm": 175.0,
            "Slope_Angle": 54.0,
            "Soil_Saturation": 0.78,
            "Vegetation_Cover": 0.30,
            "Earthquake_Activity": 3.8,
            "Proximity_to_Water": 0.35,
            "Soil_Type_Gravel": 0,
            "Soil_Type_Sand": 1,
            "Soil_Type_Silt": 0
        }
    },
    {
        "id": "ZONE-07",
        "name": "Shimla Western Ridge Sector",
        "type": "Urban Slope Subsidence Zone",
        "district": "Shimla, Himachal Pradesh",
        "center": { "lat": 31.10, "lng": 77.17 },
        "prevLandslides": 3,
        "lastIncident": "Retaining wall crack monitored",
        "geometry": {
            "type": "Polygon",
            "coordinates": [[
                [77.12, 31.06],
                [77.23, 31.07],
                [77.24, 31.14],
                [77.13, 31.13],
                [77.12, 31.06]
            ]]
        },
        "telemetry": {
            "Rainfall_mm": 110.0,
            "Slope_Angle": 48.0,
            "Soil_Saturation": 0.60,
            "Vegetation_Cover": 0.55,
            "Earthquake_Activity": 2.6,
            "Proximity_to_Water": 1.2,
            "Soil_Type_Gravel": 1,
            "Soil_Type_Sand": 0,
            "Soil_Type_Silt": 0
        }
    }
]

ROADS_DATA = [
    {
        "id": "ROAD-01",
        "name": "NH-10 (Siliguri – Gangtok Lifeline)",
        "riskLevel": "Critical",
        "geometry": {
            "type": "LineString",
            "coordinates": [
                [88.38, 26.85],
                [88.42, 26.96],
                [88.45, 27.08],
                [88.52, 27.18],
                [88.58, 27.32],
                [88.61, 27.33]
            ]
        }
    },
    {
        "id": "ROAD-02",
        "name": "NH-717A (Alternate Military Corridor)",
        "riskLevel": "Medium",
        "geometry": {
            "type": "LineString",
            "coordinates": [
                [88.58, 26.90],
                [88.62, 27.02],
                [88.67, 27.15],
                [88.60, 27.28]
            ]
        }
    },
    {
        "id": "ROAD-03",
        "name": "Chungthang – Lachen Access Road",
        "riskLevel": "Critical",
        "geometry": {
            "type": "LineString",
            "coordinates": [
                [88.64, 27.60],
                [88.62, 27.66],
                [88.58, 27.72],
                [88.55, 27.76]
            ]
        }
    },
    {
        "id": "ROAD-04",
        "name": "Guwahati Express Bypass (NH-27)",
        "riskLevel": "Low",
        "geometry": {
            "type": "LineString",
            "coordinates": [
                [91.60, 26.11],
                [91.70, 26.13],
                [91.80, 26.16],
                [91.90, 26.18]
            ]
        }
    },
    {
        "id": "ROAD-05",
        "name": "Badrinath National Highway (NH-07 Chamoli)",
        "riskLevel": "High",
        "geometry": {
            "type": "LineString",
            "coordinates": [
                [79.20, 30.30],
                [79.33, 30.41],
                [79.45, 30.52]
            ]
        }
    }
]

VILLAGES_DATA = [
    { "id": "VIL-01", "name": "Singtam Riverside Ward", "coordinate": { "lat": 27.23, "lng": 88.50 }, "population": 8450, "riskLevel": "High" },
    { "id": "VIL-02", "name": "Rangpo Transit Basti", "coordinate": { "lat": 27.17, "lng": 88.53 }, "population": 11200, "riskLevel": "Critical" },
    { "id": "VIL-03", "name": "Dikchu Hydel Settlement", "coordinate": { "lat": 27.40, "lng": 88.58 }, "population": 3600, "riskLevel": "High" },
    { "id": "VIL-04", "name": "Chungthang Valley Hamlet", "coordinate": { "lat": 27.60, "lng": 88.65 }, "population": 4100, "riskLevel": "Critical" },
    { "id": "VIL-05", "name": "Melli Bazar", "coordinate": { "lat": 27.08, "lng": 88.46 }, "population": 5200, "riskLevel": "Medium" },
    { "id": "VIL-06", "name": "Kamrup Forest Fringe", "coordinate": { "lat": 26.12, "lng": 91.78 }, "population": 16400, "riskLevel": "Low" },
    { "id": "VIL-07", "name": "Joshimath Lower Slopes", "coordinate": { "lat": 30.55, "lng": 79.56 }, "population": 7800, "riskLevel": "High" },
    { "id": "VIL-08", "name": "Kufri Hillside Colony", "coordinate": { "lat": 31.10, "lng": 77.27 }, "population": 2900, "riskLevel": "Medium" }
]

HOSPITALS_DATA = [
    { "id": "HOSP-01", "name": "STNM Multi-Specialty Hospital, Gangtok", "coordinate": { "lat": 27.32, "lng": 88.60 }, "beds": 650 },
    { "id": "HOSP-02", "name": "Singtam District Emergency Hospital", "coordinate": { "lat": 27.23, "lng": 88.49 }, "beds": 140 },
    { "id": "HOSP-03", "name": "Rangpo Border Medical Center", "coordinate": { "lat": 27.18, "lng": 88.52 }, "beds": 85 },
    { "id": "HOSP-04", "name": "Mangan North Sikkim Health Centre", "coordinate": { "lat": 27.50, "lng": 88.53 }, "beds": 75 },
    { "id": "HOSP-05", "name": "Gauhati Medical College & Hospital", "coordinate": { "lat": 26.15, "lng": 91.77 }, "beds": 1200 },
    { "id": "HOSP-06", "name": "Chamoli District Base Hospital", "coordinate": { "lat": 30.40, "lng": 79.32 }, "beds": 180 },
    { "id": "HOSP-07", "name": "Indira Gandhi Medical College (IGMC) Shimla", "coordinate": { "lat": 31.11, "lng": 77.18 }, "beds": 800 }
]

SENSORS_DATA = [
    { "id": "SENS-01", "name": "Teesta Hydro-Piezometer 01", "coordinate": { "lat": 27.24, "lng": 88.51 }, "status": "Active", "reading": "Pore pressure: 38.4 kPa (Warning Threshold: 40 kPa)" },
    { "id": "SENS-02", "name": "Rangpo Tiltmeter Alpha", "coordinate": { "lat": 27.17, "lng": 88.53 }, "status": "Active", "reading": "Displacement: +2.8 mm/24h (Accelerating)" },
    { "id": "SENS-03", "name": "Chungthang InSAR Reflector", "coordinate": { "lat": 27.61, "lng": 88.64 }, "status": "Active", "reading": "Creep rate: 4.1 mm/hr (CRITICAL ALERT)" },
    { "id": "SENS-04", "name": "Melli Acoustic Ground Sensor", "coordinate": { "lat": 27.09, "lng": 88.45 }, "status": "Active", "reading": "Subsurface noise: 12 dB (Nominal)" },
    { "id": "SENS-05", "name": "Guwahati Automated Rain Gauge", "coordinate": { "lat": 26.14, "lng": 91.75 }, "status": "Active", "reading": "Accumulated: 85 mm (Stable)" },
    { "id": "SENS-06", "name": "Alaknanda Soil Moisture Array", "coordinate": { "lat": 30.42, "lng": 79.34 }, "status": "Active", "reading": "Saturation: 78% (Elevated)" },
    { "id": "SENS-07", "name": "Shimla Slope Inclinometer Beta", "coordinate": { "lat": 31.09, "lng": 77.16 }, "status": "Active", "reading": "Lateral tilt: 0.85° (Within safety envelope)" }
]

@router.get("/risk-map")
@router.get("/api/risk-map")
def risk_map(current_user: dict = Depends(get_current_user)):
    processed_zones = []

    for cfg in MONITORED_ZONES_CONFIG:
        telemetry = cfg.get("telemetry", {})
        ml_result = compute_zone_ml_risk(telemetry)

        zone_data = {
            "id": cfg["id"],
            "name": cfg["name"],
            "type": cfg["type"],
            "district": cfg["district"],
            "center": cfg["center"],
            "geometry": cfg.get("geometry"),
            "riskLevel": ml_result["riskLevel"],
            "riskScore": ml_result["riskScore"],
            "aiProbability": ml_result["aiProbability"],
            "rainfall24h": telemetry.get("Rainfall_mm", 0.0),
            "soilMoisture": int(round(telemetry.get("Soil_Saturation", 0.0) * 100)) if telemetry.get("Soil_Saturation", 0.0) <= 1.0 else int(telemetry.get("Soil_Saturation", 0.0)),
            "slope": telemetry.get("Slope_Angle", 0.0),
            "vegetationCover": telemetry.get("Vegetation_Cover", 0.0),
            "earthquakeActivity": telemetry.get("Earthquake_Activity", 0.0),
            "prevLandslides": cfg.get("prevLandslides", 0),
            "recommendedAction": ml_result["recommendedAction"],
            "lastIncident": cfg.get("lastIncident", "No recent major incident recorded")
        }
        processed_zones.append(zone_data)

    return {
        "success": True,
        "count": len(processed_zones),
        "risks": processed_zones,
        "roads": ROADS_DATA,
        "villages": VILLAGES_DATA,
        "hospitals": HOSPITALS_DATA,
        "sensors": SENSORS_DATA
    }
