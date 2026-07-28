import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Globe, 
  Lock, 
  ArrowLeftRight, 
  Image as ImageIcon, 
  Upload, 
  Sparkles, 
  FolderPlus, 
  ArrowLeft,
  Check,
  Search,
  Keyboard,
  HelpCircle
} from 'lucide-react';
import { FlashcardSet, FlashcardFolder, Flashcard } from '../types';
import { QuickImportModal } from './QuickImportModal';

interface FlashcardSetEditorProps {
  initialSet?: FlashcardSet | null;
  folders: FlashcardFolder[];
  onSaveSet: (set: FlashcardSet, practiceNow?: boolean) => void;
  onCancel: () => void;
}

export const FlashcardSetEditor: React.FC<FlashcardSetEditorProps> = ({
  initialSet,
  folders,
  onSaveSet,
  onCancel,
}) => {
  const [title, setTitle] = useState(initialSet?.title || '');
  const [description, setDescription] = useState(initialSet?.description || '');
  const [isPublic, setIsPublic] = useState(initialSet?.isPublic ?? true);
  const [folderId, setFolderId] = useState(initialSet?.folderId || '');

  // Cards list state
  const [cards, setCards] = useState<Array<{ id: string; frontText: string; backText: string; imageUrl?: string }>>(
    initialSet?.cards && initialSet.cards.length > 0
      ? initialSet.cards.map((c) => ({
          id: c.id,
          frontText: c.frontText,
          backText: c.backText,
          imageUrl: c.imageUrl,
        }))
      : [
          { id: 'card-1', frontText: '', backText: '' },
          { id: 'card-2', frontText: '', backText: '' },
        ]
  );

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [suggestionsEnabled, setSuggestionsEnabled] = useState(true);

  // Add new card
  const handleAddCard = () => {
    setCards((prev) => [
      ...prev,
      { id: `card-${Date.now()}-${prev.length + 1}`, frontText: '', backText: '' },
    ]);
  };

  // Remove card
  const handleRemoveCard = (index: number) => {
    if (cards.length <= 1) {
      alert('Học phần cần có ít nhất 1 thẻ!');
      return;
    }
    setCards((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Update card text
  const handleUpdateCard = (index: number, field: 'frontText' | 'backText' | 'imageUrl', value: string) => {
    setCards((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  // Swap all terms & definitions
  const handleSwapTermsAndDefinitions = () => {
    setCards((prev) =>
      prev.map((c) => ({
        ...c,
        frontText: c.backText,
        backText: c.frontText,
      }))
    );
  };

  // Delete all cards
  const handleDeleteAllCards = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tất cả thẻ trong học phần này?')) {
      setCards([{ id: `card-${Date.now()}-1`, frontText: '', backText: '' }]);
    }
  };

  // Handle Quick Import Callback
  const handleImportedCards = (importedList: Partial<Flashcard>[]) => {
    const newFormattedCards = importedList.map((item, idx) => ({
      id: `card-imp-${Date.now()}-${idx}`,
      frontText: item.frontText || '',
      backText: item.backText || '',
      imageUrl: item.imageUrl,
    }));

    // Filter out completely blank initial cards
    setCards((prev) => {
      const existingFilled = prev.filter((c) => c.frontText.trim() || c.backText.trim());
      return [...existingFilled, ...newFormattedCards];
    });
  };

  // Handle Save
  const handleSave = (practiceNow: boolean = false) => {
    if (!title.trim()) {
      alert('Vui lòng nhập tiêu đề cho học phần!');
      return;
    }

    const validCards = cards.filter((c) => c.frontText.trim() || c.backText.trim());
    if (validCards.length === 0) {
      alert('Vui lòng thêm ít nhất 1 thẻ có nội dung!');
      return;
    }

    const newSet: FlashcardSet = {
      id: initialSet?.id || `set-${Date.now()}`,
      folderId: folderId || undefined,
      title: title.trim(),
      description: description.trim(),
      isPublic,
      createdAt: initialSet?.createdAt || new Date().toISOString().split('T')[0],
      cardsCount: validCards.length,
      cards: validCards.map((c, idx) => ({
        id: c.id || `card-${Date.now()}-${idx}`,
        frontText: c.frontText.trim(),
        backText: c.backText.trim(),
        imageUrl: c.imageUrl,
        status: 'new',
        nextReviewDate: new Date().toISOString(),
        intervalDays: 1,
        easeFactor: 2.5,
        repetitions: 0,
      })),
    };

    onSaveSet(newSet, practiceNow);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] text-slate-900 dark:text-slate-100 p-4 sm:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Top Header Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#E4E8F0] dark:border-[#334155]">
          <div className="flex items-center gap-4">
            <button
              onClick={onCancel}
              className="p-2.5 rounded-full bg-white dark:bg-[#1E293B] border border-[#E4E8F0] dark:border-[#334155] hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors shadow-xs"
              title="Quay lại"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl sm:text-2xl font-black text-[#1B1F2E] dark:text-white tracking-tight">
              {initialSet ? 'Chỉnh sửa học phần' : 'Tạo một học phần mới'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleSave(false)}
              className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-extrabold text-xs transition-colors"
            >
              {initialSet ? 'Lưu thay đổi' : 'Tạo'}
            </button>

            <button
              onClick={() => handleSave(true)}
              className="px-6 py-2.5 rounded-xl bg-[#2E68FF] hover:bg-blue-600 text-white font-extrabold text-xs shadow-md shadow-blue-500/20 transition-transform active:scale-95"
            >
              Tạo và ôn luyện
            </button>
          </div>
        </div>

        {/* Form Inputs: Title, Description & Folder */}
        <div className="space-y-4">
          
          {/* Visibility Toggle Badge */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setIsPublic(!isPublic)}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-[#1E293B] hover:bg-slate-50 dark:hover:bg-slate-800 border border-[#E4E8F0] dark:border-[#334155] text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors shadow-xs"
            >
              {isPublic ? (
                <>
                  <Globe className="w-4 h-4 text-emerald-500" />
                  <span>Công khai</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-amber-500" />
                  <span>Riêng tư</span>
                </>
              )}
            </button>

            {/* Folder Selection Dropdown */}
            <div className="flex items-center gap-2 bg-white dark:bg-[#1E293B] border border-[#E4E8F0] dark:border-[#334155] rounded-full px-3.5 py-1 text-xs shadow-xs">
              <FolderPlus className="w-4 h-4 text-[#2E68FF] shrink-0" />
              <select
                value={folderId}
                onChange={(e) => setFolderId(e.target.value)}
                className="bg-transparent text-slate-800 dark:text-slate-200 font-bold focus:outline-none cursor-pointer"
              >
                <option value="" className="bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300">-- Thêm vào thư mục (Không bắt buộc) --</option>
                {folders.map((f) => (
                  <option key={f.id} value={f.id} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                    📁 {f.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Title Input */}
          <div className="space-y-1">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nhập tiêu đề (ví dụ: IELTS Band 7.0 Vocabulary)"
              className="w-full px-5 py-4 rounded-2xl bg-white dark:bg-[#1E293B] border border-[#E4E8F0] dark:border-[#334155] text-slate-900 dark:text-white placeholder-slate-400 text-lg font-bold focus:outline-none focus:border-[#2E68FF] focus:ring-1 focus:ring-[#2E68FF] shadow-xs"
            />
          </div>

          {/* Description Input */}
          <div className="space-y-1">
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Thêm mô tả..."
              className="w-full px-5 py-3 rounded-2xl bg-white dark:bg-[#1E293B] border border-[#E4E8F0] dark:border-[#334155] text-slate-800 dark:text-slate-200 placeholder-slate-400 text-xs focus:outline-none focus:border-[#2E68FF] focus:ring-1 focus:ring-[#2E68FF] resize-none shadow-xs"
            />
          </div>
        </div>

        {/* Quick Action Toolbar (Matches Screenshot 1) */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-[#1E293B] border border-[#E4E8F0] dark:border-[#334155] shadow-xs">
          <div className="flex flex-wrap items-center gap-3">
            
            {/* + Nhập (Quick Import Modal trigger) */}
            <button
              type="button"
              onClick={() => setIsImportModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/80 hover:bg-blue-100 text-[#2E68FF] dark:text-blue-400 font-extrabold text-xs flex items-center gap-2 border border-blue-200 dark:border-blue-900 transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4 text-[#2E68FF]" />
              <span>Nhập (Quick Import)</span>
            </button>

            {/* + Thêm sơ đồ (Disabled / Pro feature) */}
            <button
              type="button"
              disabled
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 font-extrabold text-xs flex items-center gap-2 border border-slate-200 dark:border-slate-700 opacity-60 cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm sơ đồ</span>
              <Lock className="w-3.5 h-3.5 text-amber-500 ml-1" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* Gợi ý toggle */}
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-600 dark:text-slate-300">
              <span>Gợi ý</span>
              <button
                type="button"
                onClick={() => setSuggestionsEnabled(!suggestionsEnabled)}
                className={`w-10 h-6 rounded-full p-1 transition-colors ${
                  suggestionsEnabled ? 'bg-[#2E68FF]' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    suggestionsEnabled ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </label>

            <button
              type="button"
              onClick={handleSwapTermsAndDefinitions}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 transition-colors"
              title="Đảo thuật ngữ & định nghĩa"
            >
              <ArrowLeftRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleDeleteAllCards}
              className="p-2 rounded-xl bg-red-100 dark:bg-red-950/60 hover:bg-red-200 text-red-600 dark:text-red-400 transition-colors"
              title="Xóa tất cả thẻ"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Cards Editor List */}
        <div className="space-y-4">
          {cards.map((card, idx) => (
            <div
              key={card.id || idx}
              className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#1E293B] border border-[#E4E8F0] dark:border-[#334155] space-y-4 shadow-xs hover:border-[#2E68FF] transition-all"
            >
              {/* Card Header Bar */}
              <div className="flex items-center justify-between pb-3 border-b border-[#E4E8F0] dark:border-[#334155] text-xs font-extrabold text-slate-500">
                <span className="text-sm font-black text-slate-800 dark:text-slate-200">{idx + 1}</span>

                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-mono text-base px-1 cursor-grab">=</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveCard(idx)}
                    className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/80 text-slate-400 hover:text-red-500 transition-colors"
                    title="Xóa thẻ"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Card Inputs Grid (Term & Definition) */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                
                {/* Left Column: THUẬT NGỮ (Term) */}
                <div className="md:col-span-5 space-y-1">
                  <input
                    type="text"
                    value={card.frontText}
                    onChange={(e) => handleUpdateCard(idx, 'frontText', e.target.value)}
                    placeholder="Nhập thuật ngữ..."
                    className="w-full p-3.5 rounded-2xl bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E4E8F0] dark:border-[#334155] text-slate-900 dark:text-white placeholder-slate-400 text-sm font-medium focus:outline-none focus:border-[#2E68FF] focus:ring-1 focus:ring-[#2E68FF]"
                  />
                  <span className="text-[10px] font-extrabold text-slate-400 tracking-wider uppercase block pt-1 px-1">
                    THUẬT NGỮ
                  </span>
                </div>

                {/* Right Column: ĐỊNH NGHĨA (Definition) */}
                <div className="md:col-span-5 space-y-1">
                  <input
                    type="text"
                    value={card.backText}
                    onChange={(e) => handleUpdateCard(idx, 'backText', e.target.value)}
                    placeholder="Nhập định nghĩa..."
                    className="w-full p-3.5 rounded-2xl bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E4E8F0] dark:border-[#334155] text-slate-900 dark:text-white placeholder-slate-400 text-sm font-medium focus:outline-none focus:border-[#2E68FF] focus:ring-1 focus:ring-[#2E68FF]"
                  />
                  <span className="text-[10px] font-extrabold text-slate-400 tracking-wider uppercase block pt-1 px-1">
                    ĐỊNH NGHĨA
                  </span>
                </div>

                {/* Image Placeholder Button */}
                <div className="md:col-span-2 space-y-1">
                  <button
                    type="button"
                    onClick={() => {
                      const url = prompt('Nhập URL hình ảnh cho thẻ này:', card.imageUrl || '');
                      if (url !== null) {
                        handleUpdateCard(idx, 'imageUrl', url);
                      }
                    }}
                    className={`w-full p-3.5 rounded-2xl border border-dashed text-xs font-bold flex flex-col items-center justify-center gap-1 transition-colors ${
                      card.imageUrl
                        ? 'border-[#2E68FF] bg-blue-50 dark:bg-blue-950/40 text-[#2E68FF]'
                        : 'border-[#E4E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#0F172A] text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    <ImageIcon className="w-4 h-4" />
                    <span className="text-[10px]">
                      {card.imageUrl ? 'Sửa ảnh' : 'Hình ảnh'}
                    </span>
                  </button>
                </div>

              </div>

            </div>
          ))}
        </div>

        {/* Bottom "+ Thêm thẻ" Button (Matches Screenshot 1) */}
        <div className="text-center pt-4">
          <button
            type="button"
            onClick={handleAddCard}
            className="px-8 py-4 rounded-full bg-white dark:bg-[#1E293B] hover:bg-blue-50 dark:hover:bg-blue-950/40 text-[#1B1F2E] dark:text-white border border-[#E4E8F0] dark:border-[#334155] font-extrabold text-sm flex items-center gap-2 mx-auto shadow-md transition-transform hover:scale-105 active:scale-95"
          >
            <Plus className="w-5 h-5 text-[#2E68FF]" />
            <span>Thêm thẻ</span>
          </button>
        </div>

      </div>

      {/* Quick Import Modal */}
      <QuickImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportCards={handleImportedCards}
      />
    </div>
  );
};
