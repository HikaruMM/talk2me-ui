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

export const DEFAULT_CONFIG: OpenRouterConfig = {
  apiKey: '',
  useCustomKey: false,
  models: {
    defaultModel: 'openai/gpt-oss-20b:free',
    courseGenerator: 'openai/gpt-oss-20b:free',
    flashcardGenerator: 'nvidia/nemotron-3-nano-30b-a3b:free',
    writingGrader: 'nvidia/nemotron-3-super-120b-a12b:free',
    quizGenerator: 'google/gemma-4-31b-it:free',
  },
};

interface OpenRouterCatalogEntry {
  id: string;
  name?: string;
  description?: string;
  context_length?: number;
}

const FEATURED_PAID_PREFIXES = ['anthropic/', 'openai/', 'deepseek/'];

/**
 * Fetches OpenRouter's live model catalog (public endpoint, no key required) so the
 * Settings dropdowns always reflect models that actually exist right now — OpenRouter's
 * ":free" catalog rotates without notice, so a hardcoded list like POPULAR_MODELS below
 * inevitably goes stale. Callers should fall back to POPULAR_MODELS if this rejects
 * (offline, OpenRouter down, etc).
 */
export async function fetchLiveModels(): Promise<OpenRouterModel[]> {
  const response = await fetch('https://openrouter.ai/api/v1/models');
  if (!response.ok) {
    throw new Error(`Không lấy được danh sách model từ OpenRouter (mã lỗi ${response.status})`);
  }
  const body = await response.json();
  const entries: OpenRouterCatalogEntry[] = body?.data || [];

  const models: OpenRouterModel[] = entries
    .filter((m) => m.id.endsWith(':free') || FEATURED_PAID_PREFIXES.some((p) => m.id.startsWith(p)))
    .map((m) => {
      const isFree = m.id.endsWith(':free');
      const provider = m.id.split('/')[0];
      return {
        id: m.id,
        name: m.name || m.id,
        provider: provider.charAt(0).toUpperCase() + provider.slice(1),
        isFree,
        description: (m.description || '').slice(0, 160),
        badge: isFree ? 'Miễn Phí' : 'BYOK',
        contextLength: m.context_length ? `${Math.round(m.context_length / 1000)}k tokens` : undefined,
      };
    })
    .sort((a, b) => Number(b.isFree) - Number(a.isFree));

  return models;
}

const DEPRECATED_MODEL_KEYWORDS = [
  'gemini-2.0-flash-exp',
  'gemini-exp',
  'gemini-2.0-pro-exp',
];

export function sanitizeModelId(modelId?: string, fallback = 'openai/gpt-oss-20b:free'): string {
  if (!modelId || typeof modelId !== 'string') return fallback;
  const lower = modelId.toLowerCase();
  if (DEPRECATED_MODEL_KEYWORDS.some((kw) => lower.includes(kw))) {
    return fallback;
  }
  return modelId;
}

const STORAGE_KEY = 't2m_openrouter_config';

export function getStoredConfig(): OpenRouterConfig {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return DEFAULT_CONFIG;
    const parsed = JSON.parse(saved);
    const rawModels = parsed.models || {};
    return {
      ...DEFAULT_CONFIG,
      ...parsed,
      models: {
        defaultModel: sanitizeModelId(rawModels.defaultModel, DEFAULT_CONFIG.models.defaultModel),
        courseGenerator: sanitizeModelId(rawModels.courseGenerator, DEFAULT_CONFIG.models.courseGenerator),
        flashcardGenerator: sanitizeModelId(rawModels.flashcardGenerator, DEFAULT_CONFIG.models.flashcardGenerator),
        writingGrader: sanitizeModelId(rawModels.writingGrader, DEFAULT_CONFIG.models.writingGrader),
        quizGenerator: sanitizeModelId(rawModels.quizGenerator, DEFAULT_CONFIG.models.quizGenerator),
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
  data?: { label?: string; limit?: number; usage?: number };
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
    return {
      success: true,
      message: 'Kết nối thành công! API Key hoạt động bình thường.',
      data: {
        label: resData.data?.label || 'Key cá nhân',
        limit: resData.data?.limit,
        usage: resData.data?.usage,
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
  systemInstruction?: string
): Promise<string> {
  const config = getStoredConfig();
  const apiKey = config.useCustomKey && config.apiKey.trim() ? config.apiKey.trim() : '';
  const selectedModel = sanitizeModelId(modelId || config.models.defaultModel);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'HTTP-Referer': window.location.origin,
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

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: selectedModel,
      messages,
      temperature: 0.7,
      max_tokens: 1500,
    }),
  });

  if (!response.ok) {
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
