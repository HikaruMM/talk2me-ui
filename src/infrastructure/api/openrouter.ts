export interface OpenRouterModel {
  id: string;
  name: string;
  provider: string;
  isFree: boolean;
  description: string;
  badge?: string;
  contextLength?: string;
}

export interface OpenRouterConfig {
  apiKey: string;
  useCustomKey: boolean;
  models: {
    defaultModel: string;
    courseGenerator: string;
    flashcardGenerator: string;
    writingGrader: string;
    quizGenerator: string;
  };
}

// No model id is hardcoded anywhere in this module — OpenRouter's ":free" catalog rotates
// without notice (several previously-valid ids have gone dead mid-project). An empty
// string means "unset"; resolveModelSlots() fills every slot in from the LIVE catalog the
// moment it's available (see SettingsPage.tsx), rather than trusting a baked-in default.
export const DEFAULT_CONFIG: OpenRouterConfig = {
  apiKey: '',
  useCustomKey: false,
  models: {
    defaultModel: '',
    courseGenerator: '',
    flashcardGenerator: '',
    writingGrader: '',
    quizGenerator: '',
  },
};

interface OpenRouterCatalogEntry {
  id: string;
  name?: string;
  description?: string;
  context_length?: number;
}

/**
 * Cooldown Manager (Client-side Rate Limit 429 Registry)
 * Maps modelId -> Expiration timestamp in milliseconds
 */
const cooldownMap = new Map<string, number>();

export function markModelCooldown(modelId: string, resetHeader?: string | null): number {
  let cooldownMs = 60000; // Mặc định 60 giây

  if (resetHeader) {
    const parsed = Number(resetHeader);
    if (!Number.isNaN(parsed) && parsed > 0) {
      if (parsed > 1000000000) {
        const targetMs = parsed > 10000000000 ? parsed : parsed * 1000;
        const diff = targetMs - Date.now();
        if (diff > 0 && diff < 3600000) {
          cooldownMs = diff;
        }
      } else {
        cooldownMs = parsed * 1000;
      }
    }
  }

  const expireTime = Date.now() + cooldownMs;
  cooldownMap.set(modelId, expireTime);
  return Math.ceil(cooldownMs / 1000);
}

export function getModelCooldownSeconds(modelId: string): number {
  const expireTime = cooldownMap.get(modelId);
  if (!expireTime) return 0;
  const remaining = expireTime - Date.now();
  if (remaining <= 0) {
    cooldownMap.delete(modelId);
    return 0;
  }
  return Math.ceil(remaining / 1000);
}

export function isModelInCooldown(modelId: string): boolean {
  return getModelCooldownSeconds(modelId) > 0;
}

/**
 * Deterministically picks a free model id from the LIVE catalog by position — no model
 * name/version is ever referenced in source. `seed` just spreads different call sites
 * (default/course/quiz/writing slots, or different presets) across different catalog
 * entries instead of every slot landing on the same one.
 */
export function pickFreeModelId(catalog: OpenRouterModel[], seed = 0): string {
  const free = catalog.filter((m) => m.isFree && !isModelInCooldown(m.id));
  if (free.length === 0) return '';
  const index = ((seed % free.length) + free.length) % free.length;
  return free[index].id;
}

/**
 * Fills in any empty or no-longer-live model slot from the live catalog. Call this
 * whenever the live catalog becomes available (e.g. right after fetchLiveModels()
 * resolves) so a config saved before a model died — or one that was never set — self-heals
 * against whatever OpenRouter actually serves right now, instead of trusting a hardcoded id.
 * A user's own paid/BYOK model choice (non ":free") is left untouched.
 */
export function resolveModelSlots(
  models: OpenRouterConfig['models'],
  catalog: OpenRouterModel[]
): OpenRouterConfig['models'] {
  if (catalog.length === 0) return models; // nothing to validate against yet

  const liveFreeIds = new Set(catalog.filter((m) => m.isFree).map((m) => m.id));
  const keys: (keyof OpenRouterConfig['models'])[] = [
    'defaultModel',
    'courseGenerator',
    'flashcardGenerator',
    'writingGrader',
    'quizGenerator',
  ];

  const resolved = { ...models };
  keys.forEach((key, i) => {
    const current = resolved[key];
    const isCustomPaidModel = Boolean(current) && !current.endsWith(':free');
    if (!current || (!liveFreeIds.has(current) && !isCustomPaidModel)) {
      resolved[key] = pickFreeModelId(catalog, i);
    }
  });
  return resolved;
}

/**
 * Builds a fallback chain of 100% FREE models sourced ONLY from the LIVE catalog — no
 * hardcoded candidate list. Filters out models currently in temporary cooldown (429).
 */
export function buildFreeFallbackChain(
  primaryModelId: string,
  userSelectedModels: string[] = [],
  liveCatalog: OpenRouterModel[] = []
): string[] {
  const chain: string[] = [];

  // 1. Primary model for this specific feature/slot
  if (primaryModelId && !isModelInCooldown(primaryModelId)) {
    chain.push(primaryModelId);
  }

  // 2. All other user-selected models configured on the Settings page
  for (const modelId of userSelectedModels) {
    if (modelId && !chain.includes(modelId) && !isModelInCooldown(modelId)) {
      chain.push(modelId);
    }
  }

  // 3. Append all remaining live free models from catalog
  const availableFreeFromCatalog = liveCatalog
    .filter((m) => m.isFree)
    .map((m) => m.id)
    .filter((id) => !chain.includes(id) && !isModelInCooldown(id));

  for (const candidate of availableFreeFromCatalog) {
    chain.push(candidate);
  }

  return chain;
}

/**
 * Module-level cache: populated by fetchLiveModels() on first successful call.
 * generateCompletion() reads from this cache automatically when callers don't
 * pass a liveCatalog argument — so fallback chains work everywhere without
 * forcing every call-site to fetch & forward the catalog.
 */
let cachedLiveCatalog: OpenRouterModel[] = [];

/** Returns the cached live catalog (may be empty if fetchLiveModels hasn't resolved yet). */
export function getCachedLiveCatalog(): OpenRouterModel[] {
  return cachedLiveCatalog;
}

/**
 * Fetches OpenRouter's live model catalog and filters strictly for 100% FREE models (:free).
 * Also populates the module-level cache so that generateCompletion fallback works globally.
 */
export async function fetchLiveModels(): Promise<OpenRouterModel[]> {
  const response = await fetch('https://openrouter.ai/api/v1/models');
  if (!response.ok) {
    throw new Error(`Không lấy được danh sách model từ OpenRouter (mã lỗi ${response.status})`);
  }
  const body = await response.json();
  const entries: OpenRouterCatalogEntry[] = body?.data || [];

  const models: OpenRouterModel[] = entries
    .filter((m) => m.id.endsWith(':free'))
    .map((m) => {
      const provider = m.id.split('/')[0];
      return {
        id: m.id,
        name: m.name || m.id,
        provider: provider.charAt(0).toUpperCase() + provider.slice(1),
        isFree: true,
        description: (m.description || '').slice(0, 160),
        badge: 'Miễn Phí (0Đ)',
        contextLength: m.context_length ? `${Math.round(m.context_length / 1000)}k tokens` : undefined,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  // Cập nhật module-level cache để mọi nơi gọi generateCompletion đều có fallback
  cachedLiveCatalog = models;

  return models;
}

const STORAGE_KEY = 't2m_openrouter_config';

export function getStoredConfig(): OpenRouterConfig {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return DEFAULT_CONFIG;
    const parsed = JSON.parse(saved);
    return {
      ...DEFAULT_CONFIG,
      ...parsed,
      models: {
        ...DEFAULT_CONFIG.models,
        ...(parsed.models || {}),
      },
    };
  } catch {
    return DEFAULT_CONFIG;
  }
}

export function saveStoredConfig(config: OpenRouterConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save OpenRouter config to localStorage', e);
  }
}

export async function testOpenRouterKey(apiKey: string): Promise<{
  success: boolean;
  message: string;
  data?: {
    label?: string;
    limit?: number;
    usage?: number;
    isFreeTier?: boolean;
  };
}> {
  if (!apiKey || !apiKey.trim()) {
    return { success: false, message: 'Vui lòng nhập API Key để kiểm tra.' };
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/auth/key', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey.trim()}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        return { success: false, message: 'API Key không hợp lệ hoặc đã bị khóa.' };
      }
      return { success: false, message: `Lỗi kết nối OpenRouter (Mã: ${response.status})` };
    }

    const resData = await response.json();
    const isFreeTier = resData.data?.is_free_tier ?? true;
    const usage = resData.data?.usage ?? 0;
    const limit = resData.data?.limit ?? null;

    let infoMsg = 'Kết nối thành công! API Key hoạt động bình thường.';
    if (isFreeTier) {
      infoMsg = 'Kết nối thành công! Tài khoản Free Tier (Chi phí $0, giới hạn lượt gọi theo khung thời gian).';
    }

    return {
      success: true,
      message: infoMsg,
      data: {
        label: resData.data?.label || 'Key cá nhân',
        limit: limit,
        usage: usage,
        isFreeTier: isFreeTier,
      },
    };
  } catch {
    return {
      success: false,
      message: 'Không thể kết nối đến OpenRouter API. Vui lòng kiểm tra mạng của bạn.',
    };
  }
}

export async function generateCompletion(
  prompt: string,
  modelId?: string,
  systemInstruction?: string,
  liveCatalog: OpenRouterModel[] = []
): Promise<string> {
  const config = getStoredConfig();
  const apiKey = config.useCustomKey && config.apiKey.trim() ? config.apiKey.trim() : '';

  const effectiveCatalog = liveCatalog.length > 0 ? liveCatalog : cachedLiveCatalog;
  const selectedModel = modelId || config.models.defaultModel || pickFreeModelId(effectiveCatalog, 0);

  if (!selectedModel) {
    throw new Error('Chưa có model nào khả dụng — vui lòng chọn model trong Cài đặt và thử lại.');
  }

  if (isModelInCooldown(selectedModel)) {
    const cooldownSecs = getModelCooldownSeconds(selectedModel);
    throw new Error(`Model hiện đang trong thời gian chờ (${cooldownSecs}s). Vui lòng thử lại sau hoặc đổi sang Model khác.`);
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : '',
    'X-Title': 'Talk2Me LearnTube AI',
  };

  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  const messages = [];
  if (systemInstruction) {
    messages.push({ role: 'system', content: systemInstruction });
  }
  messages.push({ role: 'user', content: prompt });

  const payload: any = {
    model: selectedModel,
    messages,
    temperature: 0.7,
    max_tokens: 1500,
  };

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  const resetHeader = response.headers.get('X-RateLimit-Reset');

  if (!response.ok) {
    if (response.status === 429) {
      let parsedError: any = null;
      try {
        parsedError = await response.json();
      } catch {
        // body wasn't JSON — fall through, treated as upstream congestion below
      }

      // OpenRouter nests provider-level detail under error.metadata (limit_source,
      // provider_name, ...) specifically when ONE upstream provider is temporarily
      // rate-limited — that shape is absent for an account-wide ($0 tier) quota block.
      const metadata = parsedError?.error?.metadata;
      const isUpstreamCongestion = Boolean(metadata?.limit_source || metadata?.provider_name);

      if (isUpstreamCongestion) {
        markModelCooldown(selectedModel, resetHeader);
        const cooldownSecs = getModelCooldownSeconds(selectedModel) || 60;
        throw new Error(
          `Model đang tạm thời quá tải lượt gọi ở phía nhà cung cấp (${metadata?.provider_name || 'upstream'}). Hệ thống đã đưa vào danh sách chờ, thử lại sau ${cooldownSecs} giây.`
        );
      }

      // No per-provider metadata on a 429 usually means the account/key itself hit its
      // free-tier daily cap — cooling down a single model won't help, so don't pretend
      // it will; give the user the real options instead (wait for daily reset, or BYOK).
      markModelCooldown(selectedModel, resetHeader || String(24 * 3600));
      throw new Error(
        'Tài khoản/Key OpenRouter miễn phí đã đạt giới hạn lượt gọi trong ngày. Vui lòng quay lại sau khi hạn mức reset (00:00 UTC) hoặc cấu hình OpenRouter API Key riêng của bạn trong Cài đặt để không bị giới hạn.'
      );
    }
    const errorBody = await response.text();
    throw new Error(`OpenRouter API Error (${response.status}): ${errorBody}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('Không nhận được phản hồi từ AI Model.');
  }

  return content;
}
