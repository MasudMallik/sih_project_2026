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

