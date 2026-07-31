import React, { useState, useEffect } from 'react';
import { Category, Course } from '../../../core/entities';
import { CategoryCombobox } from './CategoryCombobox';
import { X, Sparkles, Youtube, CheckCircle2, Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import { useGenerateCourseMutation, useGenerationStatusQuery } from '../../../application/queries/useCourseGenerationQuery';
import { getCourseDetail } from '../../../infrastructure/api/talk2meApi';

interface CreateCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onCourseCreated: (course: Course) => void;
  prefillUrl?: string;
  onCreateCategory: (name: string) => void;
}

export const CreateCourseModal: React.FC<CreateCourseModalProps> = ({
  isOpen,
  onClose,
  categories,
  onCourseCreated,
  prefillUrl = '',
  onCreateCategory,
}) => {
  const [youtubeUrl, setYoutubeUrl] = useState(prefillUrl);
  const [selectedCategoryId, setSelectedCategoryId] = useState(categories[0]?.id || 'web-dev');
  const [difficulty, setDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');

  const [step, setStep] = useState<'input' | 'generating' | 'completed'>('input');
  const [errorMsg, setErrorMsg] = useState('');
  const [createdCourse, setCreatedCourse] = useState<Course | null>(null);
  const [activeCourseId, setActiveCourseId] = useState<string | null>(null);

  const generateMutation = useGenerateCourseMutation();
  const { data: genStatus } = useGenerationStatusQuery(activeCourseId, step === 'generating');

  useEffect(() => {
    if (prefillUrl) {
      setYoutubeUrl(prefillUrl);
    }
  }, [prefillUrl]);

  // React to background job status transitions while the modal is polling.
  useEffect(() => {
    if (!genStatus || step !== 'generating' || !activeCourseId) return;

    if (genStatus.status === 'completed') {
      getCourseDetail(activeCourseId)
        .then((course) => {
          setCreatedCourse(course);
          onCourseCreated(course);
          setStep('completed');
        })
        .catch((err: Error) => {
          setErrorMsg(err.message || 'Course was generated but could not be loaded.');
          setStep('input');
        });
    } else if (genStatus.status === 'failed') {
      setErrorMsg(genStatus.lastError || 'AI course generation failed. Please try a different video.');
      setStep('input');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [genStatus, step, activeCourseId]);

  if (!isOpen) return null;

  const handleStartGeneration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!youtubeUrl.trim()) {
      setErrorMsg('Please paste a valid YouTube URL');
      return;
    }

    setErrorMsg('');
    setStep('generating');

    try {
      const selectedCat = categories.find((c) => c.id === selectedCategoryId);
      const result = await generateMutation.mutateAsync({
        youtubeUrl,
        category: selectedCat ? selectedCat.name : 'Education & Skills',
        difficulty,
      });
      setActiveCourseId(result.courseId);
    } catch (err: any) {
      console.error('Course creation error:', err);
      setErrorMsg(err.message || 'Error creating course. Please check your YouTube link.');
      setStep('input');
    }
  };

  const totalUnits = genStatus?.totalUnits || 0;
  const completedUnits = genStatus?.completedUnits || 0;
  const progressPercent = totalUnits > 0 ? Math.round((completedUnits / totalUnits) * 100) : 0;

  const stepsList = [
    'Extracting transcript & video timestamps...',
    `AI crew analyzing content (Theory, Quiz, Writing, Speaking)... ${progressPercent}%`,
    'Building dictation & shadowing exercises...',
    'Finalizing your interactive course...',
  ];
  let genStepIndex = 0;
  if (genStatus && totalUnits > 0) {
    if (completedUnits === 0) genStepIndex = 1;
    else if (completedUnits < totalUnits) genStepIndex = 2;
    else genStepIndex = 3;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white dark:bg-[#1E293B] rounded-3xl border border-[#E4E8F0] dark:border-[#334155] shadow-2xl p-6 sm:p-8 overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-[#95A0B4] hover:bg-[#F1F4F9] dark:hover:bg-[#273449] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#2E68FF] to-[#7C5CFC] text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Sparkles className="w-6 h-6 fill-white" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-[#1B1F2E] dark:text-white">
              AI Course Generator
            </h3>
            <p className="text-xs text-[#5A6478] dark:text-[#CBD5E1]">
              Transform any YouTube video into an interactive learning course
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* STEP 1: INPUT FORM */}
        {step === 'input' && (
          <form onSubmit={handleStartGeneration} className="space-y-5">
            {/* YouTube Link Input */}
            <div>
              <label className="block text-xs font-bold text-[#1B1F2E] dark:text-[#F1F5F9] mb-1.5 uppercase tracking-wider">
                YouTube Video Link
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
                Target Skill Level
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Beginner', 'Intermediate', 'Advanced'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setDifficulty(lvl)}
                    className={`py-2.5 rounded-2xl text-xs font-bold transition-all ${
                      difficulty === lvl
                        ? 'bg-[#2E68FF] text-white shadow-sm'
                        : 'bg-[#F1F4F9] dark:bg-[#273449] text-[#5A6478] dark:text-[#CBD5E1] hover:bg-[#EAF1FF]'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Action Button */}
            <button
              type="submit"
              className="w-full py-4 rounded-2xl bg-[#2E68FF] hover:bg-[#1E52DB] text-white font-extrabold text-sm tracking-wide uppercase shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition-all mt-4"
            >
              <Sparkles className="w-4 h-4 fill-white" />
              <span>Generate AI Course Now</span>
            </button>
          </form>
        )}

        {/* STEP 2: REALTIME AI GENERATING STEPPER */}
        {step === 'generating' && (
          <div className="py-6 space-y-6 text-center">
            <div className="relative w-20 h-20 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-[#2E68FF]/20 animate-ping" />
              <div className="w-20 h-20 rounded-full bg-[#EAF1FF] dark:bg-[#1A2540] border-2 border-[#2E68FF] flex items-center justify-center text-[#2E68FF]">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            </div>

            <div className="space-y-1">
              <h4 className="text-lg font-bold text-[#1B1F2E] dark:text-white">
                Generating Your Interactive Course
              </h4>
              <p className="text-xs text-[#5A6478] dark:text-[#CBD5E1]">
                Gemini 3.6 Flash is analyzing transcript timestamps & crafting learning modules
              </p>
            </div>

            {/* Stepper Progress List */}
            <div className="space-y-3 text-left max-w-md mx-auto pt-2">
              {stepsList.map((stText, idx) => {
                const isDone = idx < genStepIndex;
                const isCurrent = idx === genStepIndex;
                return (
                  <div key={idx} className="flex items-center gap-3 text-xs sm:text-sm font-semibold">
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                    ) : isCurrent ? (
                      <Loader2 className="w-5 h-5 text-[#2E68FF] animate-spin shrink-0" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-[#95A0B4] shrink-0" />
                    )}
                    <span
                      className={
                        isDone
                          ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                          : isCurrent
                          ? 'text-[#2E68FF] dark:text-[#5B8CFF] font-bold'
                          : 'text-[#95A0B4]'
                      }
                    >
                      {stText}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 3: COMPLETED SUCCESS VIEW */}
        {step === 'completed' && createdCourse && (
          <div className="py-4 space-y-6 text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center border border-emerald-300/40">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                🎉 Course Ready!
              </span>
              <h4 className="text-xl font-extrabold text-[#1B1F2E] dark:text-white line-clamp-2">
                {createdCourse.title}
              </h4>
              <p className="text-xs text-[#5A6478] dark:text-[#CBD5E1]">
                {createdCourse.totalLessons} Lessons generated with Theory, Quiz, Dictation & Shadowing
              </p>
            </div>

            <button
              onClick={onClose}
              className="w-full py-4 rounded-2xl bg-[#2E68FF] hover:bg-[#1E52DB] text-white font-extrabold text-sm tracking-wide uppercase shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition-all"
            >
              <span>Start Course Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
