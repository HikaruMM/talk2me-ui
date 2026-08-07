/**
 * Centralized environment config for Talk2Me UI.
 *
 * All Vite env vars (prefixed with VITE_) are read here so that the rest of
 * the codebase imports from this single module instead of scattering
 * `import.meta.env.*` across dozens of files.
 */

/** Base URL for the Talk2Me FastAPI backend (no trailing slash). */
export const API_BASE_URL: string =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, '') || 'http://localhost:8000/api/v1';

/** Base URL for ONNX Runtime WASM files served by the backend. */
export const ORT_WASM_BASE_URL: string =
  import.meta.env.VITE_ORT_WASM_BASE_URL || 'http://localhost:8000/ort/';
