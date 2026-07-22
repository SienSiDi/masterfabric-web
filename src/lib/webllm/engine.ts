import type { MLCEngineInterface, InitProgressCallback } from "@mlc-ai/web-llm";

let cachedEngine: MLCEngineInterface | null = null;
let cachedModelId: string | null = null;

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export async function ensureEngine(
  modelId: string,
  onProgress?: InitProgressCallback
): Promise<MLCEngineInterface> {
  if (cachedEngine && cachedModelId === modelId) {
    return cachedEngine;
  }

  const webllm = await import("@mlc-ai/web-llm");

  let lastError: unknown = null;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const engine = await webllm.CreateMLCEngine(modelId, {
        initProgressCallback: onProgress,
        appConfig: {
          ...webllm.prebuiltAppConfig,
          cacheBackend: "indexeddb",
        },
      });

      cachedEngine = engine;
      cachedModelId = modelId;
      return engine;
    } catch (err) {
      lastError = err;
      console.warn(`[WebLLM] Attempt ${attempt}/${MAX_RETRIES} failed:`, err);

      if (attempt < MAX_RETRIES) {
        onProgress?.({
          progress: 0,
          text: `Retry ${attempt}/${MAX_RETRIES} — waiting ${RETRY_DELAY_MS / 1000}s...`,
        });
        await delay(RETRY_DELAY_MS * attempt);
      }
    }
  }

  throw lastError;
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
