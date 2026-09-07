export interface ChatResponse {
  success: boolean;
  message: string;
  response: string;
}

const API_BASE_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:8000").replace(/\/$/, "");

async function postToApi(endpoints: string[], message: string): Promise<string> {
  const token = localStorage.getItem("geo-rakshak:access-token");
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  let lastError: Error | null = null;

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify({ question: message }),
      });

      const payload = (await response.json().catch(() => null)) as ChatResponse | { detail?: string } | null;
      if (response.ok && payload && "response" in payload && payload.success) {
        return payload.response;
      }

      if (!response.ok) {
        const detail = payload && "detail" in payload ? payload.detail : undefined;
        lastError = new Error(detail || `Server responded with status ${response.status}`);
      }
    } catch (err) {
      lastError = err instanceof Error ? err : new Error("Network connection error");
    }
  }

  throw lastError || new Error("The assistant returned an invalid response.");
}

export async function sendChatMessage(message: string): Promise<string> {
  const endpoints = [
    `${API_BASE_URL}/api/chatbot`,
    `${API_BASE_URL}/chatbot`,
    `${API_BASE_URL}/api/voice`,
  ];
  return postToApi(endpoints, message);
}

export async function sendVoiceMessage(message: string): Promise<string> {
  const endpoints = [
    `${API_BASE_URL}/api/voice`,
    `${API_BASE_URL}/voice`,
    `${API_BASE_URL}/api/chatbot`,
    `${API_BASE_URL}/chatbot`,
  ];
  return postToApi(endpoints, message);
}
