/**
 * Auth Service — LOCAL PERSISTENCE PLACEHOLDER
 *
 * There is currently no live connection between this frontend and the
 * real FastAPI auth backend (Backend/auth.py): SignupForm and LoginForm
 * only run client-side validation today, and nothing is written to the
 * database. Meanwhile the Profile page needs *something* real to read.
 *
 * This module fills that gap with localStorage so the app has a single,
 * consistent source of truth for "who is signed in" and "what did they
 * register with" — instead of scattering ad-hoc storage across pages.
 *
 * REPLACE WHEN THE BACKEND IS WIRED UP:
 *   - registerUser()      -> POST /auth/signup (note: backend's User model
 *                            and SignupRequest schema don't have name/phone
 *                            yet — that needs adding server-side too)
 *   - authenticateUser()  -> POST /auth/login, store the returned JWT
 *                            instead of a plain email, and fetch the user
 *                            record from a GET /auth/me (or similar)
 *   - getCurrentUser()    -> read from the decoded token / a fetched
 *                            profile, not localStorage
 *   - logout()            -> also clear/revoke the stored token
 *
 * Passwords are never written here — see StoredUser.
 */
import type { StoredUser } from "../@types/interface/auth";

const USERS_KEY = "geo-rakshak:users";
const SESSION_KEY = "geo-rakshak:session";

type UsersByEmail = Record<string, StoredUser>;

function readUsers(): UsersByEmail {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? (JSON.parse(raw) as UsersByEmail) : {};
  } catch {
    return {};
  }
}

function writeUsers(users: UsersByEmail): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

/**
 * Called on successful signup. Persists the non-sensitive signup fields
 * keyed by email, and marks this user as the active session.
 */
export function registerUser(data: StoredUser): void {
  const email = data.email.trim().toLowerCase();
  const users = readUsers();
  users[email] = { ...data, email };
  writeUsers(users);
  localStorage.setItem(SESSION_KEY, email);
}

/**
 * Called on successful login. Since there's no real backend check yet,
 * this looks up any previously registered record for that email so a
 * returning user sees their own data. If nobody signed up with that
 * email in this browser, it starts a session with just the email —
 * there is no invented name/phone/location to show for them.
 */
export function authenticateUser(email: string): StoredUser {
  const normalizedEmail = email.trim().toLowerCase();
  const users = readUsers();
  const existing = users[normalizedEmail];

  const user: StoredUser = existing ?? {
    name: "",
    email: normalizedEmail,
    phone: "",
    location: "",
  };

  if (!existing) {
    users[normalizedEmail] = user;
    writeUsers(users);
  }

  localStorage.setItem(SESSION_KEY, normalizedEmail);
  return user;
}

/** Returns the currently signed-in user's stored data, or null if signed out. */
export function getCurrentUser(): StoredUser | null {
  const email = localStorage.getItem(SESSION_KEY);
  if (!email) return null;
  const users = readUsers();
  return users[email] ?? null;
}

/**
 * Ends the session. Registered data stays on disk so the same browser
 * can log back in and see the same profile — only the "who is currently
 * signed in" marker is cleared.
 */
export function logout(): void {
  localStorage.removeItem(SESSION_KEY);
}
