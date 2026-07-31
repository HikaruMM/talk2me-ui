export interface OpenRouterModel {
  id: string;
  name: string;
  provider: string;
  isFree: boolean;
  description: string;
  badge?: string;
  contextLength?: string;
}

export const POPULAR_MODELS: OpenRouterModel[] = [
  {
    id: 'google/gemini-2.0-flash-exp:free',
    name: 'Gemini 2.0 Flash (Free)',
    provider: 'Google',
    isFree: true,
    description: 'Tốc độ cực nhanh, đa năng, xử lý tốt tiếng Việt & suy luận tốt.',
    badge: 'Miễn Phí • Siêu Nhanh',
    contextLength: '1M tokens',
  },
  {
    id: 'deepseek/deepseek-r1:free',
    name: 'DeepSeek R1 (Free)',
    provider: 'DeepSeek',
    isFree: true,
    description: 'Mô hình suy luận chiều sâu đỉnh cao, lý tưởng cho chấm bài viết & phân tích ngữ pháp.',
    badge: 'Miễn Phí • Khuyên Dùng',
    contextLength: '64k tokens',
  },
  {
    id: 'meta-llama/llama-3.3-70b-instruct:free',
    name: 'Llama 3.3 70B Instruct (Free)',
    provider: 'Meta',
    isFree: true,
    description: 'Mô hình mã nguồn mở mạnh mẽ nhất của Meta, tạo flashcard & trắc nghiệm mượt mà.',
    badge: 'Miễn Phí • Thông Minh',
    contextLength: '128k tokens',
  },
  {
    id: 'qwen/qwen-2.5-72b-instruct:free',
    name: 'Qwen 2.5 72B Instruct (Free)',
    provider: 'Alibaba Cloud',
    isFree: true,
    description: 'Mô hình đa ngôn ngữ hàng đầu, hiểu sâu ngữ cảnh tiếng Việt và dịch thuật.',
    badge: 'Miễn Phí • Đa Ngôn Ngữ',
    contextLength: '32k tokens',
  },
  {
    id: 'anthropic/claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    isFree: false,
    description: 'Mô hình trí tuệ nhân tạo xuất sắc nhất hiện nay cho lập trình, sáng tạo & viết lách.',
    badge: 'BYOK • Cao Cấp ⚡',
    contextLength: '200k tokens',
  },
  {
    id: 'openai/gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'OpenAI',
    isFree: false,
    description: 'Bản thu nhỏ tốc độ cao của GPT-4o, chi phí cực kỳ tiết kiệm với chất lượng ấn tượng.',
    badge: 'BYOK • Tiết Kiệm 🚀',
    contextLength: '128k tokens',
  },
  {
    id: 'deepseek/deepseek-chat',
    name: 'DeepSeek V3 (Chat)',
    provider: 'DeepSeek',
    isFree: false,
    description: 'Siêu mô hình thế hệ mới, câu trả lời tự nhiên, chính xác và phản hồi cực nhanh.',
    badge: 'BYOK • Giá Rẻ',
    contextLength: '64k tokens',
  },
];

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
    defaultModel: 'google/gemini-2.0-flash-exp:free',
    courseGenerator: 'google/gemini-2.0-flash-exp:free',
    flashcardGenerator: 'meta-llama/llama-3.3-70b-instruct:free',
    writingGrader: 'deepseek/deepseek-r1:free',
    quizGenerator: 'qwen/qwen-2.5-72b-instruct:free',
  },
};

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
  const selectedModel = modelId || config.models.defaultModel || 'google/gemini-2.0-flash-exp:free';

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
