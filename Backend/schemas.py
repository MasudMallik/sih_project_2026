from pydantic import BaseModel,field_validator,Field,EmailStr

class register(BaseModel):
    full_name: str=Field(...,max_length=25,min_length=5)
    email : EmailStr
    contact_number: str
    location : str
    password : str
    confirm_password: str

class login(BaseModel):
    email :EmailStr
    password : str

class InputData(BaseModel):
    Rainfall_mm: float
    Slope_Angle: float
    Soil_Saturation: float
    Vegetation_Cover: float
    Earthquake_Activity: float
    Proximity_to_Water: float
    Soil_Type_Gravel: int
    Soil_Type_Sand: int
    Soil_Type_Silt: int

class ChatRequest(BaseModel):
    question:str