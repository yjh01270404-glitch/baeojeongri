export const AUTH_STORAGE_KEY = "rjb_auth_session_v1";
const STORAGE_KEY = AUTH_STORAGE_KEY;

export type AuthProvider = "naver" | "kakao" | "google";

export type AuthSession = {
  provider: AuthProvider;
  displayName: string;
  loggedAt: number;
};

export function readAuthSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as AuthSession;
    if (!data?.provider || !data.displayName) return null;
    return data;
  } catch {
    return null;
  }
}

export function writeAuthSession(session: AuthSession): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function clearAuthSession(): void {
  localStorage.removeItem(STORAGE_KEY);
}
