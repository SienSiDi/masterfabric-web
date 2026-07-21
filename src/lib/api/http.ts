import { useAuthStore } from "@/stores/useAuthStore";
import { API_BASE_URL } from "@/lib/config";
import type { ApiError } from "./types";

export class HttpError extends Error {
  status: number;
  body: ApiError | null;
  constructor(status: number, body: ApiError | null, message?: string) {
    super(message ?? body?.message ?? body?.error ?? `HTTP ${status}`);
    this.status = status;
    this.body = body;
  }
}

let refreshing: Promise<boolean> | null = null;

async function refreshTokens(): Promise<boolean> {
  const { refreshToken, setTokens, clear } = useAuthStore.getState();
  if (!refreshToken) return false;
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) {
      clear();
      return false;
    }
    const data = await res.json();
    setTokens({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      expiresIn: data.expiresIn,
    });
    return true;
  } catch {
    clear();
    return false;
  }
}

export interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  auth?: boolean;
  skipRefresh?: boolean;
}

export async function http<T = unknown>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { body, auth = true, skipRefresh = false, headers, ...rest } = options;
  const accessToken = useAuthStore.getState().accessToken;

  const finalHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...((headers as Record<string, string>) ?? {}),
  };
  if (auth && accessToken) {
    finalHeaders.Authorization = `Bearer ${accessToken}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: finalHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401 && auth && !skipRefresh && useAuthStore.getState().refreshToken) {
    refreshing ??= refreshTokens();
    const ok = await refreshing;
    refreshing = null;
    if (ok) {
      return http<T>(path, { ...options, skipRefresh: true });
    }
    throw new HttpError(401, { error: "unauthorized" }, "Session expired");
  }

  if (!res.ok) {
    let errBody: ApiError | null = null;
    try {
      errBody = (await res.json()) as ApiError;
    } catch {
      errBody = null;
    }
    throw new HttpError(res.status, errBody);
  }

  if (res.status === 204) {
    return undefined as T;
  }
  const text = await res.text();
  if (!text) return undefined as T;
  return JSON.parse(text) as T;
}

export const httpGet = <T = unknown>(path: string, opts?: RequestOptions) =>
  http<T>(path, { ...opts, method: "GET" });

export const httpPost = <T = unknown>(path: string, body?: unknown, opts?: RequestOptions) =>
  http<T>(path, { ...opts, method: "POST", body });

export const httpPut = <T = unknown>(path: string, body?: unknown, opts?: RequestOptions) =>
  http<T>(path, { ...opts, method: "PUT", body });

export const httpDel = <T = unknown>(path: string, opts?: RequestOptions) =>
  http<T>(path, { ...opts, method: "DELETE" });
