from jwt import encode, decode
import datetime
import os
from dotenv import load_dotenv
load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "geo_rakshak_secret_key_2026")
ALGORITHM = os.getenv("ALGORITHM", "HS256")

def create_token(data_: dict) -> str:
    data = data_.copy()
    data["iat"] = datetime.datetime.now(datetime.timezone.utc)
    data["exp"] = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=24)
    try:
        token = encode(data, key=SECRET_KEY, algorithm=ALGORITHM)
        return token
    except Exception:
        return ""

# Alias for backward compatibility
craete_token = create_token

def decode_token(token: str):
    try:
        data = decode(token, key=SECRET_KEY, algorithms=[ALGORITHM])
        return data
    except Exception:
        return None