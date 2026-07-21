import { checkSafety } from "./safety";

export interface ScoreInput {
  completion: string;
  tokensIn: number;
  tokensOut: number;
  latencyMs: number;
  userSignal: "accept" | "reject" | "edit";
  editedText?: string;
  originalCompletion?: string;
}

export interface ScoreOutput {
  correctness: number;
  latencyScore: number;
  costScore: number;
  userSignalValue: number;
  safetyFlag: boolean;
  composite: number;
}

function computeCorrectness(
  userSignal: "accept" | "reject" | "edit",
  completion: string,
  editedText?: string,
  originalCompletion?: string
): number {
  if (userSignal === "accept") return 0.7;
  if (userSignal === "reject") return 0.3;
  if (userSignal === "edit" && editedText && originalCompletion) {
    const editDistance = levenshtein(originalCompletion, editedText);
    return Math.max(0, 1 - Math.min(1, editDistance / originalCompletion.length));
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
  if (latencyMs <= 5000) return 1;
  return Math.max(0, 1 - (latencyMs - 5000) / 10000);
}

function computeCostScore(tokensIn: number, tokensOut: number): number {
  return Math.max(0, 1 - (tokensIn + tokensOut) / 4096);
}

function computeUserSignalValue(signal: "accept" | "reject" | "edit"): number {
  if (signal === "accept") return 1;
  if (signal === "edit") return 0.6;
  return 0;
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
    : 0.4 * correctness + 0.2 * latencyScore + 0.2 * costScore + 0.2 * userSignalValue;

  return {
    correctness,
    latencyScore,
    costScore,
    userSignalValue,
    safetyFlag,
    composite,
  };
}
