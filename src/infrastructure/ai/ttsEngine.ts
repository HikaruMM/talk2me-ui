import { KokoroTTS } from 'kokoro-js';
import type { ProgressInfo } from '@huggingface/transformers';

// English only — Kokoro has no Vietnamese voice. Callers must only pass English text (see
// call sites: flashcard front/term text, Writing/Speaking prompts, pronunciation practice —
// never flashcard back/definition text, which is often Vietnamese and stays on the browser's
// native speechSynthesis).
const MODEL_ID = 'onnx-community/Kokoro-82M-v1.0-ONNX';
const VOICE = 'af_heart';
const DOWNLOADED_AT_KEY = 'talk2me_tts_downloaded_at';

// Module-level singleton — loaded once per page session, reused after that (mirrors
// `cachedSession` in pronunciationScorer.ts).
let cachedTts: KokoroTTS | null = null;
let loadingPromise: Promise<KokoroTTS> | null = null;

// Repeat plays of the same text (very common — flashcards get replayed, users flip back and
// forth) skip synthesis entirely. Small bound so a long session doesn't grow this forever.
const audioCache = new Map<string, Blob>();
const AUDIO_CACHE_MAX_ENTRIES = 50;

function cacheAudio(text: string, blob: Blob): void {
  if (audioCache.size >= AUDIO_CACHE_MAX_ENTRIES) {
    const oldestKey = audioCache.keys().next().value;
    if (oldestKey !== undefined) audioCache.delete(oldestKey);
  }
  audioCache.set(text, blob);
}

async function loadModel(onProgress?: (percent: number) => void): Promise<KokoroTTS> {
  const progress_callback = (progress: ProgressInfo) => {
    if (progress.status === 'progress' && onProgress) {
      onProgress(Math.round(progress.progress));
    }
  };

  // WASM only — WebGPU was tried here but produced corrupted ("beeping") audio, most likely
  // because Kokoro's vocoder uses ops (e.g. iSTFT) that aren't yet reliable on the WebGPU
  // execution provider. WASM + int8 (q8) is the well-tested, correct-audio path.
  return KokoroTTS.from_pretrained(MODEL_ID, {
    dtype: 'q8',
    device: 'wasm',
    progress_callback,
  });
}

async function getTts(onProgress?: (percent: number) => void): Promise<KokoroTTS> {
  if (cachedTts) return cachedTts;
  if (loadingPromise) return loadingPromise;

  loadingPromise = loadModel(onProgress).then(async (tts) => {
    cachedTts = tts;
    try {
      localStorage.setItem(DOWNLOADED_AT_KEY, new Date().toISOString());
    } catch {
      // localStorage unavailable (private mode etc.) — not fatal, just loses the "already
      // downloaded" UI hint; the model itself is still cached by Transformers.js internally.
    }
    // ONNX Runtime compiles/optimizes its execution graph lazily on the FIRST inference —
    // that one-time cost otherwise lands on the user's first real button click, making it
    // feel much slower than every click after it. Absorb that cost here instead, during
    // preload (which already has its own loading indicator), so every user-triggered
    // synthesize call after this point runs at full (already-warm) speed.
    try {
      await tts.generate('Hello', { voice: VOICE });
    } catch (err) {
      console.warn('[TextToSpeech] Warm-up synthesis failed (non-fatal):', err);
    }
    return tts;
  }).finally(() => {
    loadingPromise = null;
  });

  return loadingPromise;
}

export function isTtsModelDownloaded(): boolean {
  try {
    return Boolean(localStorage.getItem(DOWNLOADED_AT_KEY));
  } catch {
    return false;
  }
}

export function getTtsDownloadedAt(): string | null {
  try {
    return localStorage.getItem(DOWNLOADED_AT_KEY);
  } catch {
    return null;
  }
}

export async function preloadTtsModel(onProgress?: (percent: number) => void): Promise<void> {
  await getTts(onProgress);
}

export async function synthesizeSpeech(text: string): Promise<Blob> {
  const cached = audioCache.get(text);
  if (cached) return cached;

  const tts = await getTts();
  const audio = await tts.generate(text, { voice: VOICE });
  const blob = audio.toBlob();
  cacheAudio(text, blob);
  return blob;
}

/** Best-effort — Transformers.js manages its own browser Cache Storage entry internally
 * (default cache name `transformers-cache`) with no official public API to clear just this
 * model, so this clears that cache wholesale plus our own "downloaded" flag. */
export async function deleteTtsModel(): Promise<void> {
  cachedTts = null;
  audioCache.clear();
  try {
    localStorage.removeItem(DOWNLOADED_AT_KEY);
  } catch {
    // ignore
  }
  try {
    if ('caches' in window) {
      await caches.delete('transformers-cache');
    }
  } catch {
    // ignore — best-effort only
  }
}
