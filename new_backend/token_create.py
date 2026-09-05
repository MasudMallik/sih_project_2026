from jwt import encode,decode
import datetime
import os
from dotenv import load_dotenv
load_dotenv()

def craete_token(data_ :dict)->str:
    data=data_.copy()
    data["iat"]=datetime.datetime.utcnow()
    data["exp"]=datetime.datetime.utcnow()+datetime.timedelta(minutes=20)
    try:
        token=encode(data,key=os.getenv("SECRET_KEY"),algorithm=os.getenv("ALGORITHM"))
    except Exception as e:
        return 
    else:
        return token

def decode_token(token:str):
    try:
        data=decode(token,key=os.getenv("SECRET_KEY"),algorithms=[os.getenv("ALGORITHM")])
    except Exception as e:
        return 
    else:
        return data