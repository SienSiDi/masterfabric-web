import { httpGet, httpPost, httpPut } from "./http";
import type {
  AuthResponse,
  MeResponse,
  RegisterResponse,
  SessionInfo,
  UpdateMeResponse,
} from "./types";

export function register(email: string, password: string) {
  return httpPost<RegisterResponse>("/api/v1/auth/register", { email, password }, { auth: false });
}

export function login(email: string, password: string) {
  return httpPost<AuthResponse>("/api/v1/auth/login", { email, password }, { auth: false });
}

export function refresh(refreshToken: string) {
  return httpPost<AuthResponse>(
    "/api/v1/auth/refresh",
    { refreshToken },
    { auth: false, skipRefresh: true }
  );
}

export function logout(refreshToken: string) {
  return httpPost<void>("/api/v1/auth/logout", { refreshToken });
}

export function me() {
  return httpGet<MeResponse>("/api/v1/me");
}

export function updateMe(email: string) {
  return httpPut<UpdateMeResponse>("/api/v1/me", { email });
}

export function changePassword(currentPassword: string, newPassword: string) {
  return httpPost<void>("/api/v1/auth/change-password", { currentPassword, newPassword });
}

export function listSessions() {
  return httpGet<{ sessions: SessionInfo[] }>("/api/v1/me/sessions");
}
