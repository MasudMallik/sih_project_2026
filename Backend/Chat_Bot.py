import os
from pathlib import Path
from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException
from Backend.schemas import ChatRequest

# Load environment variables
backend_env = Path(__file__).resolve().parent / ".env"
if backend_env.exists():
    load_dotenv(dotenv_path=backend_env)

ml_env = Path(__file__).resolve().parent.parent / "Ml_models" / ".env"
if ml_env.exists():
    load_dotenv(dotenv_path=ml_env)

load_dotenv()

groq_key = os.getenv("GROQ_API_KEY") or os.getenv("groq_api")
if groq_key:
    groq_key = groq_key.strip().strip('"').strip("'")
    os.environ["GROQ_API_KEY"] = groq_key

router = APIRouter(
    tags=["Chat_Bot"]
)

@router.post("/chatbot")
@router.post("/api/chatbot")
@router.post("/voice")
@router.post("/api/voice")
def chatbot(data: ChatRequest):
    if not data.question or not data.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty")

    user_query = data.question.strip()

    try:
        from Ml_models.rag_model import rag_pipeline_answer
        reply = rag_pipeline_answer(user_query)
        return {
            "success": True,
            "message": user_query,
            "response": reply
        }
    except Exception as e:
        print(f"Error in RAG execution: {e}")

    # Fallback response
    return {
        "success": True,
        "message": user_query,
        "response": (
            "Geo Rakshak AI Assistant: I am specialized strictly in landslide risk monitoring, "
            "disaster management, and geological early warnings. Please ask a question related to landslide safety, "
            "shelters, rainfall thresholds, or the Geo Rakshak platform."
        )
    }
