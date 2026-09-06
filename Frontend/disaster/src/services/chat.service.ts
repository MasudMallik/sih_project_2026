export interface ChatResponse {
  success: boolean;
  message: string;
  response: string;
}

const API_BASE_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:8000").replace(/\/$/, "");

export async function sendChatMessage(message: string): Promise<string> {
  const token = localStorage.getItem("geo-rakshak:access-token");
  const response = await fetch(`${API_BASE_URL}/chatbot`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: "include",
    body: JSON.stringify({ question: message }),
  });

  const payload = (await response.json().catch(() => null)) as ChatResponse | { detail?: string } | null;
  if (!response.ok) {
    const detail = payload && "detail" in payload ? payload.detail : undefined;
    throw new Error(detail || `Unable to get an assistant response (${response.status})`);
  }

  if (!payload || !("response" in payload) || !payload.success) {
    throw new Error("The assistant returned an invalid response.");
  }

  return payload.response;
}
