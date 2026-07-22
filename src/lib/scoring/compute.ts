import { checkSafety } from "./safety";

export interface ScoreInput {
  completion: string;
  tokensIn: number;
  tokensOut: number;
  latencyMs: number;
  userSignal: "accept" | "reject" | "edit";
  editedText?: string;
  originalCompletion?: string;
  modelId?: string;
}

export interface ScoreOutput {
  correctness: number;
  latencyScore: number;
  costScore: number;
  userSignalValue: number;
  safetyFlag: boolean;
  composite: number;
  grade: "A" | "B" | "C" | "D" | "F";
  breakdown: ScoreBreakdown;
}

export interface ScoreBreakdown {
  correctness: { value: number; weight: number; label: string };
  latency: { value: number; weight: number; label: string };
  cost: { value: number; weight: number; label: string };
  signal: { value: number; weight: number; label: string };
}

const WEIGHTS = {
  correctness: 0.4,
  latency: 0.2,
  cost: 0.2,
  signal: 0.2,
};

function computeCorrectness(
  userSignal: "accept" | "reject" | "edit",
  completion: string,
  editedText?: string,
  originalCompletion?: string
): number {
  if (userSignal === "accept") return 0.85;
  if (userSignal === "reject") return 0.2;
  if (userSignal === "edit" && editedText && originalCompletion) {
    const editDistance = levenshtein(originalCompletion, editedText);
    const similarity = 1 - Math.min(1, editDistance / originalCompletion.length);
    return 0.3 + similarity * 0.5;
  }
  return 0.5;
}

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

function computeLatencyScore(latencyMs: number): number {
  if (latencyMs <= 1000) return 1;
  if (latencyMs <= 3000) return 0.9;
  if (latencyMs <= 5000) return 0.7;
  if (latencyMs <= 10000) return 0.5;
  if (latencyMs <= 20000) return 0.3;
  return Math.max(0, 0.3 - (latencyMs - 20000) / 30000);
}

function computeCostScore(tokensIn: number, tokensOut: number): number {
  const total = tokensIn + tokensOut;
  if (total <= 256) return 1;
  if (total <= 512) return 0.9;
  if (total <= 1024) return 0.7;
  if (total <= 2048) return 0.5;
  return Math.max(0, 0.5 - (total - 2048) / 4096);
}

function computeUserSignalValue(signal: "accept" | "reject" | "edit"): number {
  if (signal === "accept") return 1;
  if (signal === "edit") return 0.6;
  return 0;
}

function computeGrade(composite: number): "A" | "B" | "C" | "D" | "F" {
  if (composite >= 0.8) return "A";
  if (composite >= 0.6) return "B";
  if (composite >= 0.4) return "C";
  if (composite >= 0.2) return "D";
  return "F";
}

export function computeScore(input: ScoreInput): ScoreOutput {
  const safetyFlag = checkSafety(input.completion);
  const correctness = computeCorrectness(
    input.userSignal,
    input.completion,
    input.editedText,
    input.originalCompletion
  );
  const latencyScore = computeLatencyScore(input.latencyMs);
  const costScore = computeCostScore(input.tokensIn, input.tokensOut);
  const userSignalValue = computeUserSignalValue(input.userSignal);

  const composite = safetyFlag
    ? 0
    : WEIGHTS.correctness * correctness +
      WEIGHTS.latency * latencyScore +
      WEIGHTS.cost * costScore +
      WEIGHTS.signal * userSignalValue;

  const breakdown: ScoreBreakdown = {
    correctness: { value: correctness, weight: WEIGHTS.correctness, label: "Correctness" },
    latency: { value: latencyScore, weight: WEIGHTS.latency, label: "Latency" },
    cost: { value: costScore, weight: WEIGHTS.cost, label: "Cost Efficiency" },
    signal: { value: userSignalValue, weight: WEIGHTS.signal, label: "User Signal" },
  };

  return {
    correctness,
    latencyScore,
    costScore,
    userSignalValue,
    safetyFlag,
    composite,
    grade: computeGrade(composite),
    breakdown,
  };
}
