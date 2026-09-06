from fastapi import APIRouter, Depends
from Backend.dashboardfile import get_current_user
from Backend.schemas import ChatRequest
from Ml_models.rag_model import load_data,text_split,create_db,rag_pipeline
global vector_db,flag
vector_db=None
flag=False
router = APIRouter(
    prefix="/chatbot",
    tags=["Chat_Bot"]
)
def load_models():
  global vector_db,flag
  flag=False
  try:
    document=load_data("pdfs")
    after_split=text_split(document)
    vector_db=create_db(after_split)
  except Exception as e:
    print(f"there is a problem{e}")
    flag=False
    return flag,None
    
  else:
    print("working good")
    flag=True
    return flag,vector_db

@router.post("/")
def chatbot(
    data: ChatRequest,
    # current_user=Depends(get_current_user)
):
  global vector_db,flag
  if not vector_db:
    flag,vector_db=load_models()
  if flag==False:
    return {"success":False,"error":"plesase try some time letter"}
  else:
        chat_response=rag_pipeline(vector_db,data.question)
        return {
          "success": True,
          "message": data.question,
          "response": chat_response
        }
