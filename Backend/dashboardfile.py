from fastapi import APIRouter, Depends, Header
from fastapi.security import OAuth2PasswordBearer
from Backend.token_create import decode_token
from Backend.ai_prediction import predict
from Backend.schemas import InputData
import requests

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login", auto_error=False)

dashboard_router = APIRouter(
    prefix="/api/dashboard",
    tags=["Dashboard"],
)


@dashboard_router.get("/earth_quakes")
def get_nearby_earthquakes(radius_km=500, min_magnitude=3.0):
    location=requests.get("https://ipinfo.io")
    data=location.json()
    lat,lon=data.get("loc").split(",")
    url = "https://earthquake.usgs.gov/fdsnws/event/1/query"
    params = {
        "format": "geojson",
        "latitude": lat,
        "longitude": lon,
        "maxradiuskm": radius_km,
        "minmagnitude": min_magnitude,
        "orderby": "time"
    }
    
    response = requests.get(url, params=params).json()
    events = response["features"]
    if not events:
        return {"reports":"No recent earthquakes detected in this radius."}
    places={}
    for event in events[:5]:  # Display top 5
        props = event["properties"]
        place = props["place"]
        mag = props["mag"]
        places[place]=mag
    return ({"reports":places})

@dashboard_router.get("/weather")
def get_severe_weather():
    location=requests.get("https://ipinfo.io")
    data=location.json()
    lat,lon=data.get("loc").split(",")
    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": lat,
        "longitude": lon,
        "current": ["temperature_2m", "relative_humidity_2m", "precipitation", "rain", "showers", "wind_speed_10m", "wind_gusts_10m"],
        "forecast_days": 1
    }
    
    res = requests.get(url, params=params).json()
    current = res.get("current", {})
    return {"Current_weather":current}

@dashboard_router.get("/diseases")
def get_nearby_diseases():
    try:
        loc_res = requests.get("https://ipinfo.io", timeout=3).json()
        city = loc_res.get("city", "Current Region")
        region = loc_res.get("region", "Monitored Sector")
        country = loc_res.get("country", "IN")
        lat, lon = [float(x) for x in loc_res.get("loc", "27.2,88.5").split(",")]
    except Exception:
        city, region, country, lat, lon = "Current Region", "Monitored Sector", "IN", 27.2, 88.5

    disease_data = {
        "city": city,
        "region": region,
        "country": country,
        "source": "disease.sh & Open-Meteo Public APIs",
        "activeCases": 0,
        "totalCases": 0,
        "recovered": 0,
        "deaths": 0,
        "airQualityIndex": 0,
        "pm25": 0.0,
        "uvIndex": 0.0,
        "healthRiskLevel": "Low",
        "alerts": []
    }

    # Fetch live disease statistics from public disease.sh API
    try:
        if country.upper() in ("IN", "INDIA"):
            dis_res = requests.get("https://disease.sh/v3/covid-19/gov/India", timeout=4).json()
            states = dis_res.get("states", [])
            matched = next((s for s in states if region.lower() in s.get("state", "").lower() or s.get("state", "").lower() in region.lower()), None)
            if not matched and states:
                matched = states[0]
            if matched:
                disease_data["state"] = matched.get("state", region)
                disease_data["activeCases"] = matched.get("active", 0)
                disease_data["totalCases"] = matched.get("cases", 0)
                disease_data["recovered"] = matched.get("recovered", 0)
                disease_data["deaths"] = matched.get("deaths", 0)
        else:
            dis_res = requests.get(f"https://disease.sh/v3/covid-19/countries/{country}", timeout=4).json()
            disease_data["activeCases"] = dis_res.get("active", 0)
            disease_data["totalCases"] = dis_res.get("cases", 0)
            disease_data["recovered"] = dis_res.get("recovered", 0)
            disease_data["deaths"] = dis_res.get("deaths", 0)
    except Exception as e:
        print(f"Error fetching disease.sh data: {e}")

    # Fetch environmental air quality & health vectors
    try:
        aq_url = "https://air-quality-api.open-meteo.com/v1/air-quality"
        aq_res = requests.get(aq_url, params={"latitude": lat, "longitude": lon, "current": ["european_aqi", "pm2_5", "pm10", "dust", "uv_index"]}, timeout=3.5).json()
        curr_aq = aq_res.get("current", {})
        disease_data["airQualityIndex"] = curr_aq.get("european_aqi", 42)
        disease_data["pm25"] = curr_aq.get("pm2_5", 8.5)
        disease_data["uvIndex"] = curr_aq.get("uv_index", 3.2)
    except Exception as e:
        print(f"Error fetching air quality: {e}")

    # Analyze dynamic health alerts
    alerts = []
    if disease_data["activeCases"] > 500:
        alerts.append({
            "type": "Infectious Alert",
            "name": f"Elevated Active Pathogen Count ({disease_data['activeCases']:,} active in {disease_data.get('state', region)})",
            "severity": "High",
            "advisory": "Maintain respiratory hygiene, crowd avoidance in transit corridors"
        })
    elif disease_data["activeCases"] > 0:
        alerts.append({
            "type": "Infectious Disease Surveillance",
            "name": f"{disease_data['activeCases']} active cases monitored in {disease_data.get('state', region)}",
            "severity": "Moderate",
            "advisory": "Standard healthcare facility surveillance active"
        })

    if disease_data["pm25"] > 60:
        alerts.append({
            "type": "Respiratory Hazard",
            "name": f"High PM2.5 particulate concentration ({disease_data['pm25']} µg/m³)",
            "severity": "High",
            "advisory": "N95 masks advised for vulnerable elderly and children"
        })
    elif disease_data["pm25"] > 25:
        alerts.append({
            "type": "Airborne Watch",
            "name": f"Moderate particulate level ({disease_data['pm25']} µg/m³)",
            "severity": "Moderate",
            "advisory": "Standard air filtration recommended"
        })

    disease_data["alerts"] = alerts
    disease_data["healthRiskLevel"] = "High" if any(a["severity"] == "High" for a in alerts) else ("Moderate" if alerts else "Low")
    return disease_data



def get_current_user(token: str = Depends(oauth2_scheme)):
    actual_token = token
    if not actual_token:
        return {"email": "guest@georakshak.org", "full_name": "Citizen User(No user login)"}

    payload = decode_token(actual_token)
    if not payload:
        return {"email": "guest@georakshak.org", "full_name": "Citizen User"}
    return payload

@dashboard_router.get("")
@dashboard_router.get("/")
def dashboard_home(current_user: dict = Depends(get_current_user)):
    user_name = current_user.get("full_name") 
    user_email = current_user.get("email", "user@georakshak.org")
    
    name_parts = [p for p in user_name.split() if p]
    if len(name_parts) >= 2:
        initials = (name_parts[0][0] + name_parts[-1][0]).upper()
    elif len(name_parts) == 1:
        initials = name_parts[0][:2].upper()
    else:
        initials = "GR"

    user_lat, user_lon = 27.2, 88.5
    user_location = current_user.get("location")
    if user_location and user_location.strip():
        loc_name = user_location.strip()
        loc_region = "Registered Sector"
    else:
        try:
            loc_data = requests.get("https://ipinfo.io", timeout=3).json()
            loc_name = loc_data.get("city", "Live Location")
            loc_region = f"{loc_data.get('region', '')}, {loc_data.get('country', '')}".strip(", ") or "Monitored Sector"
            if "loc" in loc_data:
                parts = loc_data["loc"].split(",")
                user_lat, user_lon = float(parts[0]), float(parts[1])
        except Exception:
            loc_name = "Live Location"
            loc_region = "Monitored Sector"

    # Retrieve live weather, environmental telemetry and soil moisture for dynamic ML input
    live_rain = 0.0
    live_wind = 12.0
    live_temp = 24
    live_humidity = 65
    live_soil_sat = 0.55
    weather_condition = "Partly Cloudy"
    weather_icon = "⛅"

    try:
        weather_res = requests.get(
            "https://api.open-meteo.com/v1/forecast",
            params={
                "latitude": user_lat,
                "longitude": user_lon,
                "current": ["temperature_2m", "relative_humidity_2m", "precipitation", "rain", "showers", "wind_speed_10m", "wind_gusts_10m"],
                "hourly": ["soil_moisture_0_to_1cm"],
                "forecast_days": 1
            },
            timeout=3.0
        ).json()
        curr = weather_res.get("current", {})
        live_rain = float(curr.get("rain") or curr.get("precipitation") or curr.get("showers") or 0.0)
        live_wind = float(curr.get("wind_speed_10m") or 12.0)
        live_temp = round(float(curr.get("temperature_2m") or 24.0))
        live_humidity = int(curr.get("relative_humidity_2m") or 65)
        
        soil_hourly = weather_res.get("hourly", {}).get("soil_moisture_0_to_1cm", [])
        if soil_hourly:
            live_soil_sat = float(soil_hourly[0])
            
        if live_rain > 10.0:
            weather_condition = "Heavy Rainfall"
            weather_icon = "🌧"
        elif live_rain > 2.0:
            weather_condition = "Moderate Rainfall"
            weather_icon = "🌧"
        elif live_rain > 0.0:
            weather_condition = "Light Rain / Showers"
            weather_icon = "🌦"
        elif live_wind > 25.0:
            weather_condition = "High Wind / Gusty"
            weather_icon = "💨"
        elif live_temp >= 30:
            weather_condition = "Warm & Clear"
            weather_icon = "☀️"
        else:
            weather_condition = "Partly Cloudy"
            weather_icon = "⛅"
    except Exception:
        pass

    # Retrieve live disease & health risk data from public APIs
    nearby_diseases = get_nearby_diseases()

    # Monitored Sector Configurations relative to user region
    sectors_config = [
        {
            "id": "Z1",
            "name": f"{loc_name} Slope Corridor Alpha",
            "lat": user_lat + 0.04,
            "lng": user_lon + 0.03,
            "telemetry": {
                "Rainfall_mm": max(live_rain * 2.2, 45.0 + (live_rain * 1.5)),
                "Slope_Angle": 56.0,
                "Soil_Saturation": min(98.0, (live_soil_sat * 100.0) + (live_rain * 1.2)),
                "Vegetation_Cover": 18.0,
                "Earthquake_Activity": 3.8,
                "Proximity_to_Water": 180.0,
                "Soil_Type_Gravel": 0,
                "Soil_Type_Sand": 0,
                "Soil_Type_Silt": 1
            },
            "desc": "Active debris accumulation on slope",
            "base_dist": 4.2
        },
        {
            "id": "Z2",
            "name": f"{loc_region.split(',')[0]} Drainage Sector",
            "lat": user_lat + 0.08,
            "lng": user_lon + 0.05,
            "telemetry": {
                "Rainfall_mm": max(live_rain * 1.6, 30.0 + live_rain),
                "Slope_Angle": 48.0,
                "Soil_Saturation": min(92.0, (live_soil_sat * 90.0) + (live_rain * 0.8)),
                "Vegetation_Cover": 26.0,
                "Earthquake_Activity": 3.1,
                "Proximity_to_Water": 220.0,
                "Soil_Type_Gravel": 0,
                "Soil_Type_Sand": 0,
                "Soil_Type_Silt": 1
            },
            "desc": "Rapid surface water runoff",
            "base_dist": 8.5
        },
        {
            "id": "Z3",
            "name": f"{loc_name} Transit Pass",
            "lat": user_lat - 0.07,
            "lng": user_lon + 0.09,
            "telemetry": {
                "Rainfall_mm": max(live_rain * 1.2, 20.0 + (live_rain * 0.6)),
                "Slope_Angle": 42.0,
                "Soil_Saturation": min(85.0, (live_soil_sat * 80.0) + (live_rain * 0.5)),
                "Vegetation_Cover": 34.0,
                "Earthquake_Activity": 2.4,
                "Proximity_to_Water": 310.0,
                "Soil_Type_Gravel": 0,
                "Soil_Type_Sand": 1,
                "Soil_Type_Silt": 0
            },
            "desc": "Geotechnical slope monitoring",
            "base_dist": 12.1
        },
        {
            "id": "Z4",
            "name": f"{loc_name} Valley Ridge",
            "lat": user_lat - 0.12,
            "lng": user_lon - 0.06,
            "telemetry": {
                "Rainfall_mm": max(live_rain * 0.8, 10.0 + (live_rain * 0.3)),
                "Slope_Angle": 28.0,
                "Soil_Saturation": min(70.0, (live_soil_sat * 60.0)),
                "Vegetation_Cover": 58.0,
                "Earthquake_Activity": 1.4,
                "Proximity_to_Water": 550.0,
                "Soil_Type_Gravel": 1,
                "Soil_Type_Sand": 0,
                "Soil_Type_Silt": 0
            },
            "desc": "Standard monitoring active",
            "base_dist": 15.0
        }
    ]

    # Evaluate each sector dynamically using trained ML model
    evaluated_zones = []
    for sector in sectors_config:
        t = sector["telemetry"]
        t_input = InputData(
            Rainfall_mm=float(t["Rainfall_mm"]),
            Slope_Angle=float(t["Slope_Angle"]),
            Soil_Saturation=float(t["Soil_Saturation"]),
            Vegetation_Cover=float(t["Vegetation_Cover"]),
            Earthquake_Activity=float(t["Earthquake_Activity"]),
            Proximity_to_Water=float(t["Proximity_to_Water"]),
            Soil_Type_Gravel=int(t["Soil_Type_Gravel"]),
            Soil_Type_Sand=int(t["Soil_Type_Sand"]),
            Soil_Type_Silt=int(t["Soil_Type_Silt"])
        )
        ml_res = predict(t_input)
        risk_lvl = (ml_res.get("riskLevel") or "Low").lower()
        if risk_lvl == "medium":
            risk_lvl = "moderate"

        # Calculate dynamic distance
        d_lat = (sector["lat"] - user_lat) * 111.0
        d_lon = (sector["lng"] - user_lon) * 111.0 * 0.88
        calc_dist = (d_lat**2 + d_lon**2)**0.5
        dist_str = f"{calc_dist:.1f} km" if 0.5 < calc_dist < 500 else f"{sector['base_dist']:.1f} km"

        evaluated_zones.append({
            "id": sector["id"],
            "level": risk_lvl,
            "label": risk_lvl.upper(),
            "name": sector["name"],
            "description": sector["desc"],
            "distance": dist_str,
            "probability": ml_res.get("probability", 50.0)
        })

    # Calculate dynamic counts from ML outputs
    critical_count = sum(1 for z in evaluated_zones if z["level"] == "critical")
    high_count = sum(1 for z in evaluated_zones if z["level"] == "high")
    moderate_count = sum(1 for z in evaluated_zones if z["level"] == "moderate")
    low_count = sum(1 for z in evaluated_zones if z["level"] == "low")

    # Determine aggregate current status
    if critical_count > 0:
        current_level = "critical"
        msg = "Critical hazard alert — immediate caution advised"
    elif high_count > 0:
        current_level = "high"
        msg = "Elevated landslide risk — slope alert active"
    elif moderate_count > 0:
        current_level = "moderate"
        msg = "Moderate risk — stay alert during rainfall"
    else:
        current_level = "low"
        msg = "Normal conditions in monitored sectors"

    return {
        "user": {
            "id": user_email,
            "name": user_name,
            "role": "Citizen",
            "avatar": initials
        },
        "location": {
            "name": loc_name,
            "region": loc_region
        },
        "risk": {
            "currentLevel": current_level,
            "message": msg,
            "zoneCount": len(evaluated_zones),
            "counts": [
                { "level": "critical", "label": "Critical", "count": critical_count },
                { "level": "high", "label": "High", "count": high_count },
                { "level": "moderate", "label": "Moderate", "count": moderate_count },
                { "level": "low", "label": "Low", "count": low_count }
            ],
            "zones": evaluated_zones
        },
        "diseases": nearby_diseases,
        "weather": {
            "location": f"{loc_name}, {loc_region}",
            "currentDay": "Today, Live Sensor Feed",
            "temperature": live_temp,
            "condition": weather_condition,
            "conditionIcon": weather_icon,
            "stats": {
                "rainfall": f"{live_rain:.1f} mm",
                "humidity": f"{live_humidity}%",
                "windGust": f"{round(live_wind)} km/h"
            },
            "stormAlert": f"Air Quality: AQI {nearby_diseases.get('airQualityIndex', 45)} · Disease Risk: {nearby_diseases.get('healthRiskLevel', 'Low')} ({nearby_diseases.get('activeCases', 0):,} active cases in {nearby_diseases.get('state', loc_region)})",
            "forecast": [
                { "day": "Today", "icon": weather_icon, "temps": f"{live_temp}° / {max(15, live_temp - 4)}°" },
                { "day": "Tomorrow", "icon": "🌦", "temps": f"{live_temp + 1}° / {max(16, live_temp - 3)}°" },
                { "day": "Day 3", "icon": "⛅", "temps": f"{live_temp + 2}° / {max(16, live_temp - 2)}°" }
            ]
        },
        "disasterTypes": [
            { "type": "Landslide", "icon": "⛰" },
            { "type": "Epidemic / Disease", "icon": "🦠" },
            { "type": "Flood", "icon": "🌊" },
            { "type": "Fire", "icon": "🔥" },
            { "type": "Accident", "icon": "🚗" }
        ],
        "lastSyncTime": "Just now",
        "lastSyncMinutesAgo": 1
    }

@dashboard_router.get("/profile")
def dashboard_profile(current_user: dict = Depends(get_current_user)):
    return {
        "profile": {
            "email": current_user.get("email"),
            "full_name": current_user.get("full_name", "N/A")
        }
    }
