import { httpGet } from "./http";
import type { AppConfig, LlmModelsResponse, LlmSession, MonitoringResponse } from "./types";

export function getConfig() {
  return httpGet<AppConfig>("/api/v1/config", { auth: false });
}

export function listModels() {
  return httpGet<LlmModelsResponse>("/api/v1/llm/models");
}

export function createSession(modelId: string, modelHash: string) {
  return httpPost<LlmSession>("/api/v1/llm/sessions", { modelId, modelHash });
}

import { httpPost } from "./http";

export function recordEvent(
  sessionId: string,
  payload: {
    prompt: string;
    completion: string;
    tokensIn: number;
    tokensOut: number;
    latencyMs: number;
  }
) {
  return httpPost<{ eventId: string }>(
    `/api/v1/llm/sessions/${sessionId}/events`,
    payload
  );
}

export function scoreEvent(
  sessionId: string,
  payload: {
    eventId: string;
    correctness: number;
    latencyScore: number;
    safetyFlag: boolean;
    costScore: number;
    userSignal: "accept" | "reject" | "edit";
    composite: number;
  }
) {
  return httpPost<{ status: string }>(
    `/api/v1/llm/sessions/${sessionId}/score`,
    payload
  );
}

export function getMonitoring() {
  return httpGet<MonitoringResponse>("/api/v1/llm/monitoring");
}
