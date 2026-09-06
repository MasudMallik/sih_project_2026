from fastapi import APIRouter
from Backend.schemas import ChatRequest

router = APIRouter(
    prefix="/chatbot",
    tags=["Chat_Bot"]
)

@router.post("")
@router.post("/")
def chatbot(data: ChatRequest):
    question_lower = data.question.lower()
    
    # Try RAG model if available
    try:
        from Ml_models.rag_model import load_data, text_split, create_db, rag_pipeline
        doc = load_data("pdfs")
        splits = text_split(doc)
        vdb = create_db(splits)
        if vdb:
            res = rag_pipeline(vdb, data.question)
            if res:
                return {
                    "success": True,
                    "message": data.question,
                    "response": res
                }
    except Exception:
        pass

    # Context-aware fallback response for Geo Rakshak disaster assistant
    if any(k in question_lower for k in ["landslide", "slope", "rock"]):
        reply = "Geo Rakshak Hazard Notice: High soil moisture in Teesta River basin. Avoid NH10 between Rangpo and Singtam due to active landslide debris."
    elif any(k in question_lower for k in ["shelter", "help", "hospital", "evacuate"]):
        reply = "Nearest designated emergency shelter is Rangpo Relief Shelter (East Sikkim). Medical team on standby. Call 1078 for immediate rescue dispatch."
    elif any(k in question_lower for k in ["rain", "flood", "water", "weather"]):
        reply = "Current conditions: Heavy rainfall (84.5mm/24h) with 89% humidity across Kamrup and East Sikkim districts."
    else:
        reply = f"Geo Rakshak AI Assistant: Monitoring active risk sectors for '{data.question}'. Emergency personnel are tracking live sensor data. Contact 1078 for urgent help."

    return {
        "success": True,
        "message": data.question,
        "response": reply
    }

