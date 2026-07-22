import type { MLCEngineInterface, InitProgressCallback } from "@mlc-ai/web-llm";

let cachedEngine: MLCEngineInterface | null = null;
let cachedModelId: string | null = null;

export async function ensureEngine(
  modelId: string,
  onProgress?: InitProgressCallback
): Promise<MLCEngineInterface> {
  if (cachedEngine && cachedModelId === modelId) {
    return cachedEngine;
  }

  const webllm = await import("@mlc-ai/web-llm");

  const engine = await webllm.CreateMLCEngine(modelId, {
    initProgressCallback: onProgress,
  });

  cachedEngine = engine;
  cachedModelId = modelId;
  return engine;
}

export function getCachedEngine(): MLCEngineInterface | null {
  return cachedEngine;
}

export function disposeEngine(): void {
  if (cachedEngine) {
    cachedEngine = null;
    cachedModelId = null;
  }
}
