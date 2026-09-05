from fastapi import APIRouter, Depends
from dashboardfile import get_current_user
from schemas import ChatRequest
router = APIRouter()
def chatbot_response(message):
text = message.lower()
if "flood" in text:
return (
  "Flood risk can increase because of heavy rainfall, "
   "river overflow and drainage problems. "
    "Follow official local emergency instructions."
)
elif "earthquake" in text:
return (
"During an earthquake, move away from windows and "
"objects that could fall. Follow official emergency "
"instructions."
  )
elif "cyclone" in text or "storm" in text:
return (
"During a severe storm or cyclone, monitor official "
"alerts and follow evacuation instructions from "
"local authorities."
)
elif "emergency" in text:
return (
            "For an immediate emergency, contact your local "
            "emergency services and follow instructions from "
            "local authorities."
        )
elif "risk" in text:
return (
   "The Disaster Risk Dashboard can estimate risk using "
    "environmental information such as rainfall, "
    "temperature, humidity and wind conditions."
)

elif "hello" in text or "hi" in text:
return (
"Hello! I am the Disaster Risk Assistant. "
"You can ask me about floods, earthquakes, "
"storms, disaster risk or emergency response."
)
else:
return (
"I can help with disaster risk, floods, earthquakes, "
"storms and emergency-response information."
)


@router.post("/chatbot")
def chatbot(
    data: ChatRequest,
    current_user=Depends(get_current_user)
):
response = chatbot_response(
data.message
)
return {
  "success": True,
   "message": data.message,
   "response": response
}
