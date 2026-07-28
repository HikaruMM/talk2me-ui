import React, { useState, useEffect } from 'react';
import { 
  Key, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  ExternalLink, 
  Zap, 
  Layers, 
  BookOpen, 
  FileText, 
  HelpCircle, 
  Bot, 
  Send,
  Sliders,
  Check,
  AlertTriangle,
  Info
} from 'lucide-react';
import { 
  POPULAR_MODELS, 
  OpenRouterConfig, 
  getStoredConfig, 
  saveStoredConfig, 
  testOpenRouterKey,
  generateCompletion,
  DEFAULT_CONFIG
} from '../services/openrouter';

interface SettingsPageProps {
  onBack?: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onBack }) => {
  const [config, setConfig] = useState<OpenRouterConfig>(getStoredConfig);
  const [apiKeyInput, setApiKeyInput] = useState<string>(config.apiKey);
  const [showApiKey, setShowApiKey] = useState<boolean>(false);
  const [isTestingKey, setIsTestingKey] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{
    success?: boolean;
    message?: string;
    details?: string;
  } | null>(null);

  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // AI Playground test
  const [testPrompt, setTestPrompt] = useState<string>(
    'Hãy cho tôi 3 lý do vì sao phương pháp Lặp lại ngắt quãng (SRS) giúp ghi nhớ từ vựng tiếng Anh tốt nhất.'
  );
  const [testSelectedModel, setTestSelectedModel] = useState<string>('google/gemini-2.0-flash-exp:free');
  const [testResponse, setTestResponse] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [playgroundError, setPlaygroundError] = useState<string>('');

  useEffect(() => {
    setApiKeyInput(config.apiKey);
  }, [config.apiKey]);

  const handleToggleMode = (useCustom: boolean) => {
    const updated = { ...config, useCustomKey: useCustom };
    setConfig(updated);
    saveStoredConfig(updated);
    showSaveNotification();
  };

  const handleTestKey = async () => {
    if (!apiKeyInput.trim()) {
      setTestResult({
        success: false,
        message: 'Vui lòng nhập API Key trước khi kiểm tra.',
      });
      return;
    }

    setIsTestingKey(true);
    setTestResult(null);

    const result = await testOpenRouterKey(apiKeyInput.trim());
    setIsTestingKey(false);

    if (result.success) {
      setTestResult({
        success: true,
        message: result.message,
        details: result.data?.label ? `Tên Key: ${result.data.label}` : undefined,
      });
    } else {
      setTestResult({
        success: false,
        message: result.message,
      });
    }
  };

  const handleSaveAll = () => {
    const updatedConfig: OpenRouterConfig = {
      ...config,
      apiKey: apiKeyInput.trim(),
      useCustomKey: apiKeyInput.trim() ? config.useCustomKey : false,
    };
    setConfig(updatedConfig);
    saveStoredConfig(updatedConfig);
    showSaveNotification();
  };

  const handleClearKey = () => {
    const updatedConfig: OpenRouterConfig = {
      ...config,
      apiKey: '',
      useCustomKey: false,
    };
    setApiKeyInput('');
    setConfig(updatedConfig);
    saveStoredConfig(updatedConfig);
    setTestResult(null);
    showSaveNotification();
  };

  const showSaveNotification = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const applyPreset = (presetType: 'free' | 'speed' | 'pro') => {
    let updatedModels = { ...config.models };

    if (presetType === 'free') {
      updatedModels = {
        defaultModel: 'google/gemini-2.0-flash-exp:free',
        courseGenerator: 'google/gemini-2.0-flash-exp:free',
        flashcardGenerator: 'meta-llama/llama-3.3-70b-instruct:free',
        writingGrader: 'deepseek/deepseek-r1:free',
        quizGenerator: 'qwen/qwen-2.5-72b-instruct:free',
      };
    } else if (presetType === 'speed') {
      updatedModels = {
        defaultModel: 'google/gemini-2.0-flash-exp:free',
        courseGenerator: 'google/gemini-2.0-flash-exp:free',
        flashcardGenerator: 'openai/gpt-4o-mini',
        writingGrader: 'deepseek/deepseek-chat',
        quizGenerator: 'google/gemini-2.0-flash-exp:free',
      };
    } else if (presetType === 'pro') {
      updatedModels = {
        defaultModel: 'anthropic/claude-3.5-sonnet',
        courseGenerator: 'anthropic/claude-3.5-sonnet',
        flashcardGenerator: 'deepseek/deepseek-chat',
        writingGrader: 'deepseek/deepseek-r1:free',
        quizGenerator: 'openai/gpt-4o-mini',
      };
    }

    const newConfig = { ...config, models: updatedModels };
    setConfig(newConfig);
    saveStoredConfig(newConfig);
    showSaveNotification();
  };

  const handleRunPlayground = async () => {
    if (!testPrompt.trim()) return;
    setIsGenerating(true);
    setPlaygroundError('');
    setTestResponse('');

    try {
      const result = await generateCompletion(testPrompt, testSelectedModel);
      setTestResponse(result);
    } catch (err: any) {
      setPlaygroundError(err.message || 'Xảy ra lỗi khi gửi yêu cầu đến OpenRouter.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      
      {/* Toast Save Notification */}
      {savedSuccess && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-600 text-white font-bold text-xs shadow-2xl animate-bounce">
          <CheckCircle2 className="w-5 h-5" />
          <span>Đã lưu cấu hình AI thành công vào Trình duyệt!</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#1E293B] via-[#0F172A] to-[#1E1B4B] text-white shadow-xl relative overflow-hidden border border-slate-700/60">
        <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
          <Key className="w-80 h-80 text-blue-400" />
        </div>

        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
            <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              Chiến Lược BYOK (Bring Your Own Key)
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              100% Client-Side LocalStorage
            </span>
            <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30">
              Chi phí vận hành 0đ
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-display">
            Cài Đặt Cấu Hình AI & OpenRouter Key
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
            Tận dụng sức mạnh của <strong>OpenRouter API</strong> với hàng trăm mô hình AI hàng đầu thế giới (Google Gemini, DeepSeek R1, Llama 3.3, Claude 3.5 Sonnet, GPT-4o). Bạn có thể dùng <strong>chế độ Miễn Phí mặc định</strong> hoặc dán <strong>1 API Key duy nhất</strong> để cá nhân hóa tốc độ & model cho từng tính năng.
          </p>
        </div>
      </div>

      {/* SECTION 1: HYBRID MODE TOGGLE */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#1E293B] border border-[#E4E8F0] dark:border-[#334155] shadow-xs space-y-6">
        <div>
          <h2 className="text-lg font-extrabold text-[#1B1F2E] dark:text-white flex items-center gap-2">
            <Sliders className="w-5 h-5 text-[#2E68FF]" />
            <span>1. Chọn Chế Độ Hoạt Động (Hybrid Model)</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Chọn giữa việc dùng sẵn hạ tầng miễn phí hoặc dùng Key cá nhân của bạn.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Card Mode 1: Default Free */}
          <div 
            onClick={() => handleToggleMode(false)}
            className={`p-5 rounded-2xl border-2 cursor-pointer transition-all space-y-3 relative flex flex-col justify-between ${
              !config.useCustomKey
                ? 'border-[#2E68FF] bg-blue-50/50 dark:bg-blue-950/30 shadow-md'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E293B] hover:border-slate-300 dark:hover:border-slate-600'
            }`}
          >
            {!config.useCustomKey && (
              <span className="absolute top-4 right-4 text-xs font-black px-2.5 py-1 rounded-full bg-[#2E68FF] text-white flex items-center gap-1 shadow-xs">
                <Check className="w-3.5 h-3.5" /> Đang chọn
              </span>
            )}

            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 flex items-center justify-center font-bold">
                🟢
              </div>
              <h3 className="font-extrabold text-base text-[#1B1F2E] dark:text-white">
                Chế độ Miễn Phí Mặc Định
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Tích hợp sẵn các Model AI miễn phí 100% trên OpenRouter (Gemini 2.0 Flash Free, DeepSeek R1 Free, Llama 3.3 Free).
              </p>
            </div>

            <div className="pt-2 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              Không cần API Key • Dùng ngay không tốn phí
            </div>
          </div>

          {/* Card Mode 2: BYOK Custom Key */}
          <div 
            onClick={() => handleToggleMode(true)}
            className={`p-5 rounded-2xl border-2 cursor-pointer transition-all space-y-3 relative flex flex-col justify-between ${
              config.useCustomKey
                ? 'border-[#2E68FF] bg-blue-50/50 dark:bg-blue-950/30 shadow-md'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E293B] hover:border-slate-300 dark:hover:border-slate-600'
            }`}
          >
            {config.useCustomKey && (
              <span className="absolute top-4 right-4 text-xs font-black px-2.5 py-1 rounded-full bg-[#2E68FF] text-white flex items-center gap-1 shadow-xs">
                <Check className="w-3.5 h-3.5" /> Đang chọn
              </span>
            )}

            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 flex items-center justify-center font-bold">
                ⚡
              </div>
              <h3 className="font-extrabold text-base text-[#1B1F2E] dark:text-white">
                Chế độ BYOK (OpenRouter Key Cá Nhân)
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Nhập 1 API Key OpenRouter duy nhất. Mở khóa Claude 3.5 Sonnet, GPT-4o, tốc độ xử lý nhanh gấp nhiều lần và không lo tắc nghẽn lượt dùng.
              </p>
            </div>

            <div className="pt-2 text-[11px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
              <Zap className="w-4 h-4" />
              Truy cập 200+ Models AI • Không giới hạn Rate Limit
            </div>
          </div>

        </div>
      </div>

      {/* SECTION 2: OPENROUTER API KEY CONFIGURATION */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#1E293B] border border-[#E4E8F0] dark:border-[#334155] shadow-xs space-y-6">
        <div>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-[#1B1F2E] dark:text-white flex items-center gap-2">
              <Key className="w-5 h-5 text-[#2E68FF]" />
              <span>2. Quản Lý OpenRouter API Key</span>
            </h2>

            <span className={`text-xs font-bold px-3 py-1 rounded-full ${
              config.apiKey ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
            }`}>
              {config.apiKey ? '✓ Đã cấu hình Key' : 'Chưa nhập Key'}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Nhập duy nhất 1 API Key từ OpenRouter.ai để cấp quyền cho toàn bộ các tính năng AI trong ứng dụng.
          </p>
        </div>

        {/* Input & Actions */}
        <div className="space-y-4">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            OpenRouter API Key (bắt đầu bằng <code className="text-[#2E68FF]">sk-or-v1-...</code>)
          </label>

          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                className="w-full pl-4 pr-10 py-3 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700 text-xs font-mono text-[#1B1F2E] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2E68FF]"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleTestKey}
                disabled={isTestingKey}
                className="px-5 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[#1B1F2E] dark:text-white font-bold text-xs flex items-center gap-2 transition-colors shrink-0 disabled:opacity-50"
              >
                {isTestingKey ? <RefreshCw className="w-4 h-4 animate-spin text-[#2E68FF]" /> : <Zap className="w-4 h-4 text-amber-500" />}
                <span>Kiểm tra Key</span>
              </button>

              <button
                type="button"
                onClick={handleSaveAll}
                className="px-6 py-3 rounded-2xl bg-[#2E68FF] hover:bg-blue-600 text-white font-bold text-xs flex items-center gap-2 transition-colors shrink-0 shadow-md"
              >
                <Check className="w-4 h-4" />
                <span>Lưu Cấu Hình</span>
              </button>
            </div>
          </div>

          {/* Test Result Alert */}
          {testResult && (
            <div className={`p-4 rounded-2xl text-xs space-y-1 flex items-start gap-3 animate-in fade-in duration-150 ${
              testResult.success
                ? 'bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                : 'bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-900 dark:text-red-200'
            }`}>
              {testResult.success ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-bold">{testResult.message}</p>
                {testResult.details && <p className="text-[11px] opacity-80">{testResult.details}</p>}
              </div>
            </div>
          )}

          {/* Key Controls footer */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>
                <strong>Bảo mật tuyệt đối:</strong> Key lưu an toàn trong <code>localStorage</code> trên máy bạn, không lưu trên Database trung gian.
              </span>
            </div>

            {config.apiKey && (
              <button
                type="button"
                onClick={handleClearKey}
                className="text-xs font-bold text-red-500 hover:text-red-700 dark:hover:text-red-400 underline underline-offset-4"
              >
                Xóa Key & Quay về Mặc Định
              </button>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 3: MODEL MAPPING PER FEATURE */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#1E293B] border border-[#E4E8F0] dark:border-[#334155] shadow-xs space-y-6">
        <div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-extrabold text-[#1B1F2E] dark:text-white flex items-center gap-2">
                <Bot className="w-5 h-5 text-[#2E68FF]" />
                <span>3. Phân Mạch Model AI Cho Từng Tính Năng</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Tùy chỉnh mô hình AI tối ưu nhất cho từng tác vụ riêng biệt trong khóa học.
              </p>
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-400 hidden sm:inline">Cấu hình nhanh:</span>
              <button
                type="button"
                onClick={() => applyPreset('free')}
                className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-600 dark:text-emerald-400 text-xs font-bold transition-colors"
                title="Tự động chọn các model :free tốt nhất"
              >
                🟢 100% Free
              </button>
              <button
                type="button"
                onClick={() => applyPreset('speed')}
                className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-600 dark:text-blue-400 text-xs font-bold transition-colors"
                title="Sử dụng Gemini Flash 2.0 & DeepSeek V3"
              >
                🚀 Tốc Độ Fast
              </button>
              <button
                type="button"
                onClick={() => applyPreset('pro')}
                className="px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 text-purple-600 dark:text-purple-400 text-xs font-bold transition-colors"
                title="Sử dụng Claude 3.5 Sonnet & DeepSeek R1"
              >
                ⚡ Pro Đỉnh Cao
              </button>
            </div>
          </div>
        </div>

        {/* Feature Mapping Dropdowns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          {/* Feature 1: Course Generator */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#1B1F2E] dark:text-white">
              <BookOpen className="w-4 h-4 text-[#2E68FF]" />
              <span>Tạo Khóa Học & Bài Giảng Tự Động</span>
            </div>
            <p className="text-[11px] text-slate-500">Phân tích video YouTube, tổng hợp lý thuyết & transcript.</p>
            <select
              value={config.models.courseGenerator}
              onChange={(e) => {
                const newConfig = {
                  ...config,
                  models: { ...config.models, courseGenerator: e.target.value },
                };
                setConfig(newConfig);
                saveStoredConfig(newConfig);
              }}
              className="w-full p-2.5 rounded-xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 text-xs font-semibold text-[#1B1F2E] dark:text-white focus:ring-2 focus:ring-[#2E68FF]"
            >
              {POPULAR_MODELS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.provider}) {m.isFree ? '• [Free]' : '• [BYOK]'}
                </option>
              ))}
            </select>
          </div>

          {/* Feature 2: Flashcards Generator */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#1B1F2E] dark:text-white">
              <Layers className="w-4 h-4 text-[#2E68FF]" />
              <span>Tạo Thẻ Ghi Nhớ Flashcard (SRS)</span>
            </div>
            <p className="text-[11px] text-slate-500">Trích xuất từ vựng, phiên âm IPA, câu ví dụ chuẩn & ngữ cảnh.</p>
            <select
              value={config.models.flashcardGenerator}
              onChange={(e) => {
                const newConfig = {
                  ...config,
                  models: { ...config.models, flashcardGenerator: e.target.value },
                };
                setConfig(newConfig);
                saveStoredConfig(newConfig);
              }}
              className="w-full p-2.5 rounded-xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 text-xs font-semibold text-[#1B1F2E] dark:text-white focus:ring-2 focus:ring-[#2E68FF]"
            >
              {POPULAR_MODELS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.provider}) {m.isFree ? '• [Free]' : '• [BYOK]'}
                </option>
              ))}
            </select>
          </div>

          {/* Feature 3: Writing & Essay Grader */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#1B1F2E] dark:text-white">
              <FileText className="w-4 h-4 text-emerald-500" />
              <span>Chấm Bài Viết & Sửa Lỗi Ngữ Pháp (Writing)</span>
            </div>
            <p className="text-[11px] text-slate-500">Đánh giá IELTS Band score, chỉ ra lỗi sai chi tiết & bài mẫu sửa.</p>
            <select
              value={config.models.writingGrader}
              onChange={(e) => {
                const newConfig = {
                  ...config,
                  models: { ...config.models, writingGrader: e.target.value },
                };
                setConfig(newConfig);
                saveStoredConfig(newConfig);
              }}
              className="w-full p-2.5 rounded-xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 text-xs font-semibold text-[#1B1F2E] dark:text-white focus:ring-2 focus:ring-[#2E68FF]"
            >
              {POPULAR_MODELS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.provider}) {m.isFree ? '• [Free]' : '• [BYOK]'}
                </option>
              ))}
            </select>
          </div>

          {/* Feature 4: Quiz Questions Generator */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#1B1F2E] dark:text-white">
              <HelpCircle className="w-4 h-4 text-purple-500" />
              <span>Tạo Câu Hỏi Trắc Nghiệm (Quiz & Dictation)</span>
            </div>
            <p className="text-[11px] text-slate-500">Tạo 4-5 câu hỏi kiểm tra độ hiểu bài & bài tập chính tả.</p>
            <select
              value={config.models.quizGenerator}
              onChange={(e) => {
                const newConfig = {
                  ...config,
                  models: { ...config.models, quizGenerator: e.target.value },
                };
                setConfig(newConfig);
                saveStoredConfig(newConfig);
              }}
              className="w-full p-2.5 rounded-xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 text-xs font-semibold text-[#1B1F2E] dark:text-white focus:ring-2 focus:ring-[#2E68FF]"
            >
              {POPULAR_MODELS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.provider}) {m.isFree ? '• [Free]' : '• [BYOK]'}
                </option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* SECTION 4: STEP-BY-STEP GUIDE ON HOW TO GET OPENROUTER KEY */}
      <div className="p-6 rounded-3xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/50 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-[#1B1F2E] dark:text-white flex items-center gap-2">
            <Info className="w-5 h-5 text-[#2E68FF]" />
            <span>Hướng Dẫn 3 Bước Lấy OpenRouter API Key Miễn Phí (0Đ)</span>
          </h3>
          <a
            href="https://openrouter.ai/keys"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl bg-[#2E68FF] hover:bg-blue-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors shrink-0"
          >
            <span>Đến OpenRouter.ai</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          
          <div className="p-4 rounded-2xl bg-white dark:bg-[#1E293B] border border-blue-100 dark:border-blue-900/40 space-y-1.5">
            <div className="w-6 h-6 rounded-full bg-blue-500 text-white font-extrabold text-xs flex items-center justify-center">
              1
            </div>
            <h4 className="font-bold text-xs text-[#1B1F2E] dark:text-white">Đăng ký tài khoản</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Truy cập <strong>openrouter.ai</strong> và đăng nhập bằng tài khoản Google hoặc GitHub hoàn toàn miễn phí.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#1E293B] border border-blue-100 dark:border-blue-900/40 space-y-1.5">
            <div className="w-6 h-6 rounded-full bg-blue-500 text-white font-extrabold text-xs flex items-center justify-center">
              2
            </div>
            <h4 className="font-bold text-xs text-[#1B1F2E] dark:text-white">Tạo Key Mới</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Vào mục <strong>Keys</strong> {'->'} Bấm <strong>Create Key</strong>. Đặt tên gợi ý bất kỳ (VD: <em>Talk2Me Key</em>).
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#1E293B] border border-blue-100 dark:border-blue-900/40 space-y-1.5">
            <div className="w-6 h-6 rounded-full bg-blue-500 text-white font-extrabold text-xs flex items-center justify-center">
              3
            </div>
            <h4 className="font-bold text-xs text-[#1B1F2E] dark:text-white">Dán Key & Sử dụng</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Sao chép mã Key bắt đầu bằng <code>sk-or-v1-...</code> dán vào ô số 2 bên trên và tận hưởng tốc độ vượt trội!
            </p>
          </div>

        </div>
      </div>

      {/* SECTION 5: INTERACTIVE AI PLAYGROUND TEST TOOL */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#1E293B] border border-[#E4E8F0] dark:border-[#334155] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-[#1B1F2E] dark:text-white flex items-center gap-2">
            <Bot className="w-5 h-5 text-purple-500" />
            <span>4. Thử Nghiệm Gọi AI Trực Tiếp (AI Playground)</span>
          </h3>
          <span className="text-xs text-slate-400 font-normal">
            Kiểm tra xem Model AI hoạt động ra sao thực tế
          </span>
        </div>

        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="sm:w-1/3">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Chọn Model Thử Nghiệm
              </label>
              <select
                value={testSelectedModel}
                onChange={(e) => setTestSelectedModel(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700 text-xs font-semibold text-[#1B1F2E] dark:text-white"
              >
                {POPULAR_MODELS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.provider})
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:w-2/3">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Câu Hỏi Prompt Thử Nghiệm
              </label>
              <input
                type="text"
                value={testPrompt}
                onChange={(e) => setTestPrompt(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700 text-xs text-[#1B1F2E] dark:text-white"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleRunPlayground}
              disabled={isGenerating}
              className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-2 transition-colors disabled:opacity-50 shadow-sm"
            >
              {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>{isGenerating ? 'Đang gửi yêu cầu đến OpenRouter...' : 'Gửi Yêu Cầu Thử AI'}</span>
            </button>
          </div>

          {/* Error Message */}
          {playgroundError && (
            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300">
              <strong>Lỗi:</strong> {playgroundError}
            </div>
          )}

          {/* AI Response Output */}
          {testResponse && (
            <div className="p-4 rounded-2xl bg-slate-900 text-slate-100 text-xs font-mono leading-relaxed space-y-2 border border-slate-800">
              <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800 pb-2">
                <span>🤖 Phản Hồi Từ Model: {testSelectedModel}</span>
                <span className="text-emerald-400 font-bold">200 OK</span>
              </div>
              <p className="whitespace-pre-wrap font-sans text-xs text-slate-200">{testResponse}</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
