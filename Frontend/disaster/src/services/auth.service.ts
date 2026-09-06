import type { StoredUser } from "../@types/interface/auth";

const API_BASE_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:8000").replace(/\/$/, "");

const TOKEN_KEY = "geo-rakshak:access-token";
const SESSION_KEY = "geo-rakshak:session";
const USER_DATA_KEY = "geo-rakshak:user-data";

export interface RegisterPayload {
  name: string;
  email: string;
  phone: string;
  location: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  email?: string;
  full_name?: string;
  message?: string;
}

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export async function registerUserApi(data: RegisterPayload): Promise<AuthResponse> {
  const normalizedEmail = data.email.trim().toLowerCase();
  
  try {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        full_name: data.name,
        email: normalizedEmail,
        contact_number: data.phone,
        location: data.location,
        password: data.password,
        confirm_password: data.confirmPassword,
      }),
    });

    const body = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(body?.detail || `Registration failed (${response.status})`);
    }

    if (body?.token) {
      localStorage.setItem(TOKEN_KEY, body.token);
    }
    localStorage.setItem(SESSION_KEY, normalizedEmail);

    const user: StoredUser = {
      name: data.name,
      email: normalizedEmail,
      phone: data.phone,
      location: data.location,
    };
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(user));

    return {
      success: true,
      token: body?.token,
      email: normalizedEmail,
      full_name: data.name,
    };
  } catch (err) {
    // If backend server is unavailable, fallback to local storage
    const user: StoredUser = {
      name: data.name,
      email: normalizedEmail,
      phone: data.phone,
      location: data.location,
    };
    localStorage.setItem(SESSION_KEY, normalizedEmail);
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
    localStorage.setItem(TOKEN_KEY, "local-fallback-token");

    if (err instanceof Error && err.message.includes("Registration failed")) {
      throw err;
    }
    
    return {
      success: true,
      email: normalizedEmail,
      full_name: data.name,
    };
  }
}

export async function authenticateUserApi(email: string, password?: string): Promise<AuthResponse> {
  const normalizedEmail = email.trim().toLowerCase();

  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: normalizedEmail,
        password: password || "",
      }),
    });

    const body = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(body?.detail || `Login failed (${response.status})`);
    }

    if (body?.token) {
      localStorage.setItem(TOKEN_KEY, body.token);
    }
    localStorage.setItem(SESSION_KEY, normalizedEmail);

    const existingUserRaw = localStorage.getItem(USER_DATA_KEY);
    let user: StoredUser;
    if (existingUserRaw) {
      user = JSON.parse(existingUserRaw) as StoredUser;
      user.email = normalizedEmail;
      if (body?.full_name) user.name = body.full_name;
    } else {
      user = {
        name: body?.full_name || normalizedEmail.split("@")[0],
        email: normalizedEmail,
        phone: "",
        location: "",
      };
    }
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(user));

    return {
      success: true,
      token: body?.token,
      email: normalizedEmail,
      full_name: body?.full_name || user.name,
    };
  } catch (err) {
    // Fallback if backend is unreachable or local demo session
    if (err instanceof Error && (err.message.includes("Invalid") || err.message.includes("failed"))) {
      throw err;
    }
    localStorage.setItem(SESSION_KEY, normalizedEmail);
    localStorage.setItem(TOKEN_KEY, "local-fallback-token");
    return {
      success: true,
      email: normalizedEmail,
    };
  }
}

export function getCurrentUser(): StoredUser | null {
  const email = localStorage.getItem(SESSION_KEY);
  if (!email) return null;
  const raw = localStorage.getItem(USER_DATA_KEY);
  if (raw) {
    try {
      return JSON.parse(raw) as StoredUser;
    } catch {
      // ignore
    }
  }
  return {
    name: email.split("@")[0].toUpperCase(),
    email: email,
    phone: "",
    location: "Guwahati, Assam",
  };
}

export async function logout(): Promise<void> {
  try {
    await fetch(`${API_BASE_URL}/logout`, { method: "POST" }).catch(() => null);
  } finally {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(USER_DATA_KEY);
    sessionStorage.clear();
  }
}

// Backward compatibility helpers
export function registerUser(data: StoredUser): void {
  const normalizedEmail = data.email.trim().toLowerCase();
  localStorage.setItem(SESSION_KEY, normalizedEmail);
  localStorage.setItem(USER_DATA_KEY, JSON.stringify(data));
  if (!localStorage.getItem(TOKEN_KEY)) {
    localStorage.setItem(TOKEN_KEY, "local-token");
  }
}

export function authenticateUser(email: string): StoredUser {
  const normalizedEmail = email.trim().toLowerCase();
  localStorage.setItem(SESSION_KEY, normalizedEmail);
  if (!localStorage.getItem(TOKEN_KEY)) {
    localStorage.setItem(TOKEN_KEY, "local-token");
  }
  return getCurrentUser() || { name: email.split("@")[0], email: normalizedEmail, phone: "", location: "" };
}

