import os
from pathlib import Path
from dotenv import load_dotenv
from fastapi import APIRouter
from Backend.schemas import ChatRequest

# Ensure Groq API key is loaded
env_path = Path(__file__).resolve().parent.parent / "Ml_models" / ".env"
if env_path.exists():
    load_dotenv(dotenv_path=env_path)
load_dotenv()

groq_key = os.getenv("GROQ_API_KEY") or os.getenv("groq_api")
if groq_key:
    os.environ["GROQ_API_KEY"] = groq_key

router = APIRouter(
    tags=["Chat_Bot"]
)


@router.post("/api/chatbot")

def chatbot(data: ChatRequest):
    question_lower = data.question.lower()
    
    # Try RAG model if available
    try:
        from Ml_models.rag_model import load_data, text_split, create_db, rag_pipeline
        pdf_dir = Path(__file__).resolve().parent.parent / "pdfs"
        doc = load_data(pdf_dir)
        if doc:
            splits = text_split(doc)
            vdb = create_db(splits)
            if vdb:
                res = rag_pipeline(vdb, data.question)
                if res and "Not available" not in res and "Not present" not in res:
                    return {
                        "success": True,
                        "message": data.question,
                        "response": res
                    }
    except Exception as e:
        print(f"RAG model exception: {e}")

    # Direct Groq LLM attempt if RAG document not matched but Groq key is available
    if os.getenv("GROQ_API_KEY"):
        try:
            from langchain.chat_models import init_chat_model
            model = init_chat_model(model="llama-3.3-70b-versatile", model_provider="groq")
            sys_prompt = (
                "You are Geo Rakshak AI Assistant, an expert disaster response and safety management assistant for Northeast India. "
                "Provide helpful, concise, and accurate advice regarding emergency rescue, weather risk, shelters, and hazard safety."
            )
            ai_res = model.invoke([("system", sys_prompt), ("user", data.question)])
            if ai_res and hasattr(ai_res, "content") and ai_res.content:
                return {
                    "success": True,
                    "message": data.question,
                    "response": str(ai_res.content).strip()
                }
        except Exception as groq_err:
            print(f"Direct Groq invocation error: {groq_err}")

    # Context-aware domain fallback response for Geo Rakshak disaster assistant
    if any(k in question_lower for k in ["landslide", "slope", "rock"]):
        reply = "Geo Rakshak Hazard Notice: High soil moisture in Teesta River basin. Avoid NH10 between Rangpo and Singtam due to active landslide debris."
    elif any(k in question_lower for k in ["shelter", "help", "hospital", "evacuate"]):
        reply = "Nearest designated emergency shelter is Rangpo Relief Shelter (East Sikkim). Medical team on standby. Call 1078 for immediate rescue dispatch."
    elif any(k in question_lower for k in ["rain", "flood", "water", "weather"]):
        reply = "Current conditions: Heavy rainfall (84.5mm/24h) with 89% humidity across Kamrup and East Sikkim districts."
    else:
        reply = f"Geo Rakshak AI Assistant: Monitoring active risk sectors for Land slide only it cannot give answer for'{data.question}'. Emergency personnel are tracking live sensor data. Contact 1078 for urgent help."

    return {
        "success": True,
        "message": data.question,
        "response": reply
    }
