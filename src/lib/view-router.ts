export type View = "auth" | "app" | "llm";

export type AuthSub = "login" | "register" | "forgot-password";
export type AppSub = "dashboard" | "sessions" | "monitoring" | "settings";
export type LlmSub = "model-loader" | "chat" | "event-submit";

export type Sub = AuthSub | AppSub | LlmSub;

export interface ViewState {
  view: View;
  sub: Sub;
}

export const AUTH_SUBS: AuthSub[] = ["login", "register", "forgot-password"];
export const APP_SUBS: AppSub[] = ["dashboard", "sessions", "monitoring", "settings"];
export const LLM_SUBS: LlmSub[] = ["model-loader", "chat", "event-submit"];

const VALID_VIEWS: View[] = ["auth", "app", "llm"];

export function isView(v: unknown): v is View {
  return typeof v === "string" && (VALID_VIEWS as string[]).includes(v);
}

export function isAuthSub(v: unknown): v is AuthSub {
  return typeof v === "string" && (AUTH_SUBS as string[]).includes(v);
}

export function isAppSub(v: unknown): v is AppSub {
  return typeof v === "string" && (APP_SUBS as string[]).includes(v);
}

export function isLlmSub(v: unknown): v is LlmSub {
  return typeof v === "string" && (LLM_SUBS as string[]).includes(v);
}

export function parseViewState(
  viewParam: string | null,
  subParam: string | null,
  defaultView: View = "auth"
): ViewState {
  const view = isView(viewParam) ? viewParam : defaultView;
  let sub: Sub = "login";
  if (view === "auth") {
    sub = isAuthSub(subParam) ? subParam : "login";
  } else if (view === "app") {
    sub = isAppSub(subParam) ? subParam : "dashboard";
  } else if (view === "llm") {
    sub = isLlmSub(subParam) ? subParam : "model-loader";
  }
  return { view, sub };
}

export function buildViewUrl(view: View, sub: Sub): string {
  return `/?view=${view}&sub=${sub}`;
}
