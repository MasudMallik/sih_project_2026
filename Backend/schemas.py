from pydantic import BaseModel, Field

# String alias for email to ensure compatibility without external dependency issues
EmailStr = str

class register(BaseModel):
    full_name: str = Field(..., max_length=100, min_length=2)
    email: str
    contact_number: str
    location: str
    password: str
    confirm_password: str

class login(BaseModel):
    email: str
    password: str

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
    question: str