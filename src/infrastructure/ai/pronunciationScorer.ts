/**
 * PronunciationScorer — main-thread RPC wrapper around pronunciationScorer.worker.ts.
 *
 * Actual ONNX Runtime Web inference + CTC forced alignment + GOP scoring runs in the
 * worker, off the main thread, so long scoring calls no longer freeze UI rendering/input
 * (same rationale and protocol shape as ttsEngine.ts/ttsEngine.worker.ts). This file:
 * - decodes the recorded audio Blob → PCM (needs AudioContext, main-thread only)
 * - downloads/caches the model bytes via resourceManager (needs CacheStorage + localStorage
 *   bookkeeping tied to the main-thread pronunciationDownloadStore singleton — see the
 *   worker file's header comment for why that can't move into the worker)
 * - transfers PCM/model bytes to the worker and relays its progress/status back to callers,
 *   preserving the exact same exported function signatures as before the worker move so no
 *   caller needs to change.
 */

import { blobToPcm16k, normalizeAudio } from './audioProcessor';
import { getStoredModelBuffer, downloadModel } from './resourceManager';
import type { FromWorkerMessage, ToWorkerMessage } from './pronunciationScorer.worker';
import type { ShadowingResult } from '../../core/entities';

export type ScorerStatus = 'idle' | 'loading-model' | 'scoring' | 'ready' | 'error';

let scorerWorker: Worker | null = null;
let modelLoadedInWorker = false;
let modelLoadPromise: Promise<void> | null = null;
let nextRequestId = 1;
const pendingScores = new Map<number, { resolve: (result: ShadowingResult) => void; reject: (err: Error) => void }>();

function getWorker(): Worker {
  if (scorerWorker) return scorerWorker;

  const worker = new Worker(new URL('./pronunciationScorer.worker.ts', import.meta.url), { type: 'module' });

  worker.addEventListener('message', (event: MessageEvent<FromWorkerMessage>) => {
    const msg = event.data;
    if (msg.type === 'score-done') {
      pendingScores.get(msg.requestId)?.resolve(msg.result);
      pendingScores.delete(msg.requestId);
    } else if (msg.type === 'score-error') {
      pendingScores.get(msg.requestId)?.reject(new Error(msg.message));
      pendingScores.delete(msg.requestId);
    }
    // 'model-loaded' / 'model-error' are handled by the one-off listener registered
    // inside ensureModelLoaded() for the in-flight load call, not here.
  });

  // The worker itself failing to load/parse is a new failure mode this file didn't have
  // before (no worker = nothing to crash) — without this, any pending score promise would
  // hang forever instead of rejecting so the caller's error UI can show.
  worker.addEventListener('error', (event: ErrorEvent) => {
    const err = new Error(event.message || 'Pronunciation scorer worker crashed');
    for (const { reject } of pendingScores.values()) reject(err);
    pendingScores.clear();
  });

  scorerWorker = worker;
  return worker;
}

function postToWorker(message: ToWorkerMessage, transfer: Transferable[]): void {
  getWorker().postMessage(message, transfer);
}

/** Downloads (if needed) the model bytes on the main thread, then transfers them into the
 * worker to build the ONNX session there. Deduped — concurrent scoreAudio()/preload() calls
 * share one in-flight load, and once the worker has a session this resolves immediately. */
async function ensureModelLoaded(onProgress?: (percent: number) => void): Promise<void> {
  if (modelLoadedInWorker) {
    onProgress?.(100);
    return;
  }
  if (modelLoadPromise) return modelLoadPromise;

  modelLoadPromise = (async () => {
    let buffer = await getStoredModelBuffer();

    if (!buffer) {
      buffer = await downloadModel((percent) => {
        onProgress?.(Math.round(percent * 0.85));
      });
    } else {
      onProgress?.(80);
    }

    onProgress?.(90);

    const worker = getWorker();
    await new Promise<void>((resolve, reject) => {
      const onMessage = (event: MessageEvent<FromWorkerMessage>) => {
        const msg = event.data;
        if (msg.type === 'model-loaded') {
          worker.removeEventListener('message', onMessage);
          resolve();
        } else if (msg.type === 'model-error') {
          worker.removeEventListener('message', onMessage);
          reject(new Error(msg.message));
        }
      };
      worker.addEventListener('message', onMessage);

      const modelBuffer = buffer!.buffer.slice(buffer!.byteOffset, buffer!.byteOffset + buffer!.byteLength);
      postToWorker({ type: 'load-model', buffer: modelBuffer }, [modelBuffer]);
    });

    onProgress?.(100);
    modelLoadedInWorker = true;
  })().finally(() => {
    modelLoadPromise = null;
  });

  return modelLoadPromise;
}

// ─── Public API ──────────────────────────────────────────

/**
 * Score pronunciation of an audio recording against target text.
 *
 * Pipeline (see pronunciationScorer.worker.ts for steps 2 onward):
 * 1. Audio Blob → PCM 16kHz mono (Float32Array) — main thread
 * 2. ONNX Wav2Vec2 INT8 inference → logits — worker
 * 3. Log-softmax → log probabilities — worker
 * 4. CTC Forced Alignment (Viterbi) → char segments — worker
 * 5. G2P → map chars to phonemes → GOP scoring — worker
 * 6. Return ShadowingResult with per-word, per-phoneme scores
 */
export async function scorePronounciation(
  audioBlob: Blob,
  targetText: string,
  onProgress?: (percent: number) => void,
  onStatusChange?: (status: ScorerStatus) => void
): Promise<ShadowingResult> {
  try {
    // 1. Load model (no-op if already loaded in the worker)
    onStatusChange?.('loading-model');
    await ensureModelLoaded(onProgress);

    // 2. Process audio
    onStatusChange?.('scoring');
    const pcmRaw = await blobToPcm16k(audioBlob);
    const pcm = normalizeAudio(pcmRaw);

    // 3. Run scoring in the worker
    const result = await new Promise<ShadowingResult>((resolve, reject) => {
      const requestId = nextRequestId++;
      pendingScores.set(requestId, { resolve, reject });

      const pcmBuffer = pcm.buffer.slice(pcm.byteOffset, pcm.byteOffset + pcm.byteLength);
      postToWorker({ type: 'score', requestId, pcm: pcmBuffer, targetText }, [pcmBuffer]);
    });

    onStatusChange?.('ready');
    return result;
  } catch (error) {
    onStatusChange?.('error');
    throw error;
  }
}

/**
 * Preload the model in background (e.g., when user opens Shadowing tab).
 */
export async function preloadModel(
  onProgress?: (percent: number) => void
): Promise<void> {
  await ensureModelLoaded(onProgress);
}
