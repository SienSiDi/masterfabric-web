export interface User {
  id: string;
  email: string;
  roles: string[];
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: User;
}

export interface RegisterResponse {
  userId: string;
  email: string;
}

export interface SessionInfo {
  id: string;
  createdAt: string;
  lastSeenAt: string;
  revokedAt: string | null;
}

export interface MeResponse extends User {}

export interface UpdateMeResponse extends User {}

export interface LlmModel {
  modelId: string;
  estimatedBytes: number;
  recommended: boolean;
}

export interface LlmModelsResponse {
  models: LlmModel[];
}

export interface AppConfig {
  webllm: {
    modelId: string;
    modelUrl: string;
    estimatedBytes: number;
  };
  features: {
    scoring: boolean;
    monitoring: boolean;
  };
  limits: {
    maxPromptChars: number;
    ratePerMin: number;
  };
}

export interface LlmSession {
  sessionId: string;
  modelId: string;
  modelHash: string;
  createdAt: string;
}

export interface InferenceEvent {
  eventId: string;
  prompt: string;
  completion: string;
  tokensIn: number;
  tokensOut: number;
  latencyMs: number;
  createdAt: string;
}

export interface InferenceEventsList {
  events: InferenceEvent[];
  page: number;
  limit: number;
  total: number;
}

export interface MonitoringWindow {
  from: string;
  to: string;
}

export interface MonitoringTotals {
  errors: number;
  events: number;
  scoredEvents: number;
  sessions: number;
}

export interface MonitoringLatency {
  maxMs: number;
  p50Ms: number;
  p95Ms: number;
}

export interface MonitoringTokens {
  inTotal: number;
  outTotal: number;
}

export interface MonitoringScores {
  avgComposite: number;
  avgCorrectness: number;
  safetyFlagRate: number;
  userAcceptRate: number;
}

export interface MonitoringByModel {
  modelId: string;
  events: number;
  avgComposite: number;
  p50Ms: number;
}

export interface MonitoringResponse {
  window: MonitoringWindow;
  totals: MonitoringTotals;
  latency: MonitoringLatency;
  tokens: MonitoringTokens;
  scores: MonitoringScores;
  byModel: MonitoringByModel[];
}

export interface ApiError {
  error: string;
  message?: string;
  status?: number;
}
