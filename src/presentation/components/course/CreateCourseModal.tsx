import React, { useState, useEffect } from 'react';
import { Category } from '../../../core/entities';
import { CategoryCombobox } from './CategoryCombobox';
import {
  X,
  Sparkles,
  Youtube,
  Loader2,
  AlertCircle,
  Puzzle,
  Download,
  ExternalLink,
  Copy,
  CheckCircle2,
  RefreshCw,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { useGenerateCourseMutation } from '../../../application/queries/useCourseGenerationQuery';
import { getGenerationStatus, GenerateCourseClientData } from '../../../infrastructure/api/talk2meApi';
import { fetchYoutubeOEmbedMetadata } from '../../../infrastructure/api/youtubeOEmbed';
import {
  fetchTranscriptViaExtension,
  checkExtensionInstalled,
  EXTENSION_DRIVE_LINK,
} from '../../../infrastructure/api/youtubeTranscriptExtension';

interface CreateCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onCourseQueued: () => void;
  prefillUrl?: string;
  onCreateCategory: (name: string) => void;
}

const EARLY_FAILURE_POLL_MS = 1500;
const EARLY_FAILURE_TIMEOUT_MS = 15000;

async function waitForEarlyFailure(courseId: string): Promise<string | null> {
  const deadline = Date.now() + EARLY_FAILURE_TIMEOUT_MS;
  while (Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, EARLY_FAILURE_POLL_MS));
    try {
      const status = await getGenerationStatus(courseId);
      if (status.status === 'failed') {
        return status.lastError || 'Tạo khoá học thất bại.';
      }
      if (status.status !== 'queued') {
        return null;
      }
    } catch {
      return null;
    }
  }
  return null;
}

export const CreateCourseModal: React.FC<CreateCourseModalProps> = ({
  isOpen,
  onClose,
  categories,
  onCourseQueued,
  prefillUrl = '',
  onCreateCategory,
}) => {
  const selectableCategories = categories.filter((c) => c.id !== 'all');
  const defaultCatId = selectableCategories[0]?.id || 'english';

  const [youtubeUrl, setYoutubeUrl] = useState(prefillUrl);
  const [selectedCategoryId, setSelectedCategoryId] = useState(defaultCatId);
  const [difficulty, setDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');
  const [errorMsg, setErrorMsg] = useState('');
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [isFetchingClientData, setIsFetchingClientData] = useState(false);

  // Extension status & guide view state
  const [hasExtension, setHasExtension] = useState<boolean | null>(null);
  const [isCheckingExtension, setIsCheckingExtension] = useState(false);
  const [showExtensionGuide, setShowExtensionGuide] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const generateMutation = useGenerateCourseMutation();

  const runExtensionCheck = async () => {
    setIsCheckingExtension(true);
    const installed = await checkExtensionInstalled();
    setHasExtension(installed);
    setIsCheckingExtension(false);
  };

  useEffect(() => {
    if (prefillUrl) {
      setYoutubeUrl(prefillUrl);
    }
  }, [prefillUrl]);

  useEffect(() => {
    if (isOpen) {
      runExtensionCheck();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const resetForm = () => {
    setYoutubeUrl('');
    setSelectedCategoryId(defaultCatId);
    setDifficulty('Intermediate');
    setErrorMsg('');
    setShowExtensionGuide(false);
  };

  const handleStartGeneration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!youtubeUrl.trim()) {
      setErrorMsg('Vui lòng nhập đường dẫn YouTube hợp lệ.');
      return;
    }

    setErrorMsg('');

    try {
      const selectedCat = categories.find((c) => c.id === selectedCategoryId);

      setIsFetchingClientData(true);
      const [metadata, transcriptSegments] = await Promise.all([
        fetchYoutubeOEmbedMetadata(youtubeUrl),
        fetchTranscriptViaExtension(youtubeUrl),
      ]);
      setIsFetchingClientData(false);

      const clientData: GenerateCourseClientData = {
        ...(transcriptSegments ? { transcriptSegments } : {}),
        ...(metadata
          ? { videoTitle: metadata.title, videoThumbnail: metadata.thumbnail, videoChannel: metadata.channel }
          : {}),
      };

      const { courseId } = await generateMutation.mutateAsync({
        youtubeUrl,
        category: selectedCat ? selectedCat.name : 'Tiếng Anh & Ngoại Ngữ',
        difficulty,
        clientData,
      });

      setIsCheckingStatus(true);
      const earlyError = await waitForEarlyFailure(courseId);
      setIsCheckingStatus(false);

      if (earlyError) {
        setErrorMsg(earlyError);
        return;
      }

      resetForm();
      onCourseQueued();
    } catch (err: any) {
      console.error('Course creation error:', err);
      setIsFetchingClientData(false);
      setIsCheckingStatus(false);
      setErrorMsg(err.message || 'Lỗi khởi tạo khóa học. Vui lòng kiểm tra lại liên kết YouTube.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white dark:bg-[#1E293B] rounded-3xl border border-[#E4E8F0] dark:border-[#334155] shadow-2xl p-6 sm:p-8 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-[#95A0B4] hover:bg-[#F1F4F9] dark:hover:bg-[#273449] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {showExtensionGuide ? (
          /* Extension Dev Mode Guide View */
          <div className="space-y-4 overflow-y-auto pr-1">
            <div className="flex items-center gap-3 pb-3 border-b border-[#E4E8F0] dark:border-[#334155]">
              <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                <Puzzle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-[#1B1F2E] dark:text-white">
                  Hướng Dẫn Cài Đặt Extension (Dev Mode)
                </h3>
                <p className="text-xs text-[#5A6478] dark:text-[#CBD5E1]">
                  Tải và cài đặt thủ công tiện ích Talk2Me để bứt phá tốc độ trích xuất phụ đề
                </p>
              </div>
            </div>

            {/* Status Indicator */}
            <div
              className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs font-semibold ${
                hasExtension
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                  : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300'
              }`}
            >
              <div className="flex items-center gap-2">
                {hasExtension ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                ) : (
                  <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0" />
                )}
                <span>
                  {hasExtension
                    ? 'Đã phát hiện Talk2Me Extension sẵn sàng!'
                    : 'Chưa phát hiện Extension trên trình duyệt này'}
                </span>
              </div>
              <button
                type="button"
                onClick={runExtensionCheck}
                disabled={isCheckingExtension}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 text-xs font-bold transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isCheckingExtension ? 'animate-spin' : ''}`} />
                <span>Kiểm tra lại</span>
              </button>
            </div>

            {/* Step-by-Step Instructions */}
            <div className="space-y-3">
              {/* Step 1 */}
              <div className="p-3.5 rounded-2xl bg-[#F8FAFC] dark:bg-[#273449] border border-slate-200/80 dark:border-slate-700/60 space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                    <span className="w-5 h-5 rounded-full bg-[#2E68FF] text-white flex items-center justify-center text-[10px]">
                      1
                    </span>
                    <span>Tải tập tin Extension từ Google Drive</span>
                  </div>
                  <a
                    href={EXTENSION_DRIVE_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#2E68FF] hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Tải về từ Drive</span>
                    <ExternalLink className="w-3 h-3 ml-0.5" />
                  </a>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 pl-7 leading-relaxed">
                  Bấm nút trên để truy cập Google Drive. Tải thư mục/file zip extension về máy và <strong>giải nén</strong> ra một thư mục trên máy tính.
                </p>
              </div>

              {/* Step 2 */}
              <div className="p-3.5 rounded-2xl bg-[#F8FAFC] dark:bg-[#273449] border border-slate-200/80 dark:border-slate-700/60 space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                    <span className="w-5 h-5 rounded-full bg-[#2E68FF] text-white flex items-center justify-center text-[10px]">
                      2
                    </span>
                    <span>Mở trang Quản lý tiện ích Chrome</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText('chrome://extensions');
                      setCopiedLink(true);
                      setTimeout(() => setCopiedLink(false), 2000);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all"
                  >
                    {copiedLink ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? 'Đã sao chép!' : 'Copy: chrome://extensions'}</span>
                  </button>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 pl-7 leading-relaxed">
                  Mở thẻ mới trên trình duyệt Chrome và truy cập địa chỉ <code className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-800 rounded font-mono text-[11px]">chrome://extensions</code>.
                </p>
              </div>

              {/* Step 3 */}
              <div className="p-3.5 rounded-2xl bg-[#F8FAFC] dark:bg-[#273449] border border-slate-200/80 dark:border-slate-700/60 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                  <span className="w-5 h-5 rounded-full bg-[#2E68FF] text-white flex items-center justify-center text-[10px]">
                    3
                  </span>
                  <span>Bật Chế độ nhà phát triển (Developer mode)</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 pl-7 leading-relaxed">
                  Gạt công tắc <strong>Developer mode</strong> ở góc trên bên phải màn hình quản lý tiện ích Chrome sang vị trí <strong>BẬT (ON)</strong>.
                </p>
              </div>

              {/* Step 4 */}
              <div className="p-3.5 rounded-2xl bg-[#F8FAFC] dark:bg-[#273449] border border-slate-200/80 dark:border-slate-700/60 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                  <span className="w-5 h-5 rounded-full bg-[#2E68FF] text-white flex items-center justify-center text-[10px]">
                    4
                  </span>
                  <span>Nạp tiện ích đã giải nén (Load unpacked)</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 pl-7 leading-relaxed">
                  Bấm nút <strong>"Tải tiện ích đã giải nén"</strong> (Load unpacked) ở góc trên bên trái và chọn thư mục chứa Extension vừa giải nén ở Bước 1.
                </p>
              </div>
            </div>

            {/* Back Button */}
            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowExtensionGuide(false)}
                className="w-full py-3.5 rounded-2xl bg-[#2E68FF] hover:bg-[#1E52DB] text-white font-extrabold text-xs uppercase tracking-wide shadow-md flex items-center justify-center gap-2 transition-all"
              >
                <span>Quay lại Tạo khóa học</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* Normal Course Creation Form View */
          <div>
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#2E68FF] to-[#7C5CFC] text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <Sparkles className="w-6 h-6 fill-white" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-[#1B1F2E] dark:text-white">
                    Tạo Khóa Học AI
                  </h3>
                  <p className="text-xs text-[#5A6478] dark:text-[#CBD5E1]">
                    Chuyển đổi mọi video YouTube thành khóa học tiếng Anh tương tác
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowExtensionGuide(true)}
                className="mr-8 px-2.5 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60 hover:bg-purple-100 text-xs font-bold flex items-center gap-1.5 transition-all shrink-0"
                title="Hướng dẫn cài đặt Talk2Me Extension"
              >
                <Puzzle className="w-3.5 h-3.5 text-purple-500" />
                <span className="hidden sm:inline">Cài Extension</span>
              </button>
            </div>

            {/* Extension Banner (if extension not installed) */}
            {hasExtension === false && (
              <div className="mb-4 p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <Puzzle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span>
                    Chưa cài <strong>Talk2Me Extension</strong> để trích xuất phụ đề YouTube?
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowExtensionGuide(true)}
                  className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] shrink-0 shadow-sm transition-all flex items-center gap-1"
                >
                  <span>Hướng dẫn Dev Mode</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* Error Alert */}
            {errorMsg && (
              <div className="mb-4 p-3 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Input Form */}
            <form onSubmit={handleStartGeneration} className="space-y-5">
              {/* YouTube Link Input */}
              <div>
                <label className="block text-xs font-bold text-[#1B1F2E] dark:text-[#F1F5F9] mb-1.5 uppercase tracking-wider">
                  Đường Dẫn Video YouTube
                </label>
                <div className="relative">
                  <Youtube className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500" />
                  <input
                    type="text"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full pl-11 pr-4 py-3 text-xs sm:text-sm rounded-2xl bg-[#F1F4F9] dark:bg-[#273449] border border-[#E4E8F0] dark:border-[#334155] text-[#1B1F2E] dark:text-white focus:ring-2 focus:ring-[#2E68FF] focus:outline-none placeholder-[#95A0B4]"
                    required
                    disabled={generateMutation.isPending || isCheckingStatus || isFetchingClientData}
                  />
                </div>
              </div>

              {/* Category Combobox */}
              <CategoryCombobox
                categories={categories}
                selectedCategoryId={selectedCategoryId}
                onSelectCategory={(id) => setSelectedCategoryId(id)}
                onCreateNewCategory={(name) => {
                  onCreateCategory(name);
                }}
              />

              {/* Difficulty Level Selector */}
              <div>
                <label className="block text-xs font-bold text-[#1B1F2E] dark:text-[#F1F5F9] mb-1.5 uppercase tracking-wider">
                  Trình Độ Mục Tiêu
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'Beginner', label: 'Sơ cấp' },
                    { id: 'Intermediate', label: 'Trung cấp' },
                    { id: 'Advanced', label: 'Nâng cao' },
                  ].map((lvl) => (
                    <button
                      key={lvl.id}
                      type="button"
                      onClick={() => setDifficulty(lvl.id as any)}
                      className={`py-2.5 rounded-2xl text-xs font-bold transition-all ${
                        difficulty === lvl.id
                          ? 'bg-[#2E68FF] text-white shadow-sm'
                          : 'bg-[#F1F4F9] dark:bg-[#273449] text-[#5A6478] dark:text-[#CBD5E1] hover:bg-[#EAF1FF]'
                      }`}
                    >
                      {lvl.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Action Button */}
              <button
                type="submit"
                disabled={generateMutation.isPending || isCheckingStatus || isFetchingClientData}
                className="w-full py-4 rounded-2xl bg-[#2E68FF] hover:bg-[#1E52DB] disabled:opacity-60 text-white font-extrabold text-sm tracking-wide uppercase shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition-all mt-4"
              >
                {generateMutation.isPending || isCheckingStatus || isFetchingClientData ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 fill-white" />
                )}
                <span>
                  {isFetchingClientData
                    ? 'Đang lấy phụ đề video...'
                    : isCheckingStatus
                      ? 'Đang kiểm tra video...'
                      : 'Bắt Đầu Tạo Khóa Học AI'}
                </span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
