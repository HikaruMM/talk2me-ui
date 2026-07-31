import React, { useState } from 'react';
import { Course } from '../../core/entities';
import { 
  TheoryReader, 
  QuizPlayer, 
  DictationExercise, 
  ShadowingExercise, 
  WritingExercise, 
  SpeakingExercise 
} from '../components/exercises';
import { ArrowLeft, Sparkles } from 'lucide-react';

interface CourseDetailPageProps {
  course: Course;
  onBack: () => void;
  onOpenCreateModal?: (url?: string) => void;
}

export const CourseDetailPage: React.FC<CourseDetailPageProps> = ({
  course,
  onBack,
  onOpenCreateModal,
}) => {
  const [activeLessonIndex, setActiveLessonIndex] = useState(0);
  const [activeMode, setActiveMode] = useState<'theory' | 'quiz' | 'dictation' | 'shadowing' | 'writing' | 'speaking'>('theory');

  const currentLesson = course.lessons[activeLessonIndex] || course.lessons[0];

  return (
    <div className="max-w-[1680px] w-full mx-auto px-4 sm:px-6 lg:px-10 py-6 space-y-4">
      
      {/* Top Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white dark:bg-[#1E293B] border border-[#E4E8F0] dark:border-[#334155] shadow-2xs text-xs font-bold text-[#2E68FF] hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Course Library</span>
        </button>

        <div className="flex flex-wrap items-center gap-2.5">
          <span className="px-3 py-1.5 rounded-2xl bg-blue-100 dark:bg-blue-950/80 text-[#2E68FF] font-extrabold text-xs">
            {course.category}
          </span>

          <span className="text-slate-500 dark:text-slate-400 text-xs font-bold px-1">
            Channel: {course.channelName || 'YouTube'}
          </span>

          {onOpenCreateModal && (
            <button
              onClick={() => onOpenCreateModal(course.youtubeUrl)}
              className="px-4 py-2 rounded-2xl bg-white dark:bg-[#1E293B] border border-[#E4E8F0] dark:border-[#334155] text-[#1B1F2E] dark:text-white text-xs font-bold flex items-center gap-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#2E68FF]" />
              <span>Re-generate with AI</span>
            </button>
          )}
        </div>
      </div>

      {/* Mode Switcher Bar */}
      <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-2xl bg-white dark:bg-[#1E293B] border border-[#E4E8F0] dark:border-[#334155] shadow-sm">
        <button
          onClick={() => setActiveMode('theory')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
            activeMode === 'theory'
              ? 'bg-[#7C5CFC] text-white shadow-md'
              : 'text-[#5A6478] hover:bg-purple-50 dark:hover:bg-purple-950/40 dark:text-[#CBD5E1]'
          }`}
        >
          <span>📖 Theory</span>
        </button>

        <button
          onClick={() => setActiveMode('quiz')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
            activeMode === 'quiz'
              ? 'bg-[#2E68FF] text-white shadow-md'
              : 'text-[#5A6478] hover:bg-blue-50 dark:hover:bg-blue-950/40 dark:text-[#CBD5E1]'
          }`}
        >
          <span>✓ Quiz ({currentLesson?.quizQuestions?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveMode('dictation')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
            activeMode === 'dictation'
              ? 'bg-[#0EA5C4] text-white shadow-md'
              : 'text-[#5A6478] hover:bg-cyan-50 dark:hover:bg-cyan-950/40 dark:text-[#CBD5E1]'
          }`}
        >
          <span>🎧 Dictation</span>
        </button>

        <button
          onClick={() => setActiveMode('shadowing')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
            activeMode === 'shadowing'
              ? 'bg-[#EC4899] text-white shadow-md'
              : 'text-[#5A6478] hover:bg-pink-50 dark:hover:bg-pink-950/40 dark:text-[#CBD5E1]'
          }`}
        >
          <span>🔁 Shadowing</span>
        </button>

        <button
          onClick={() => setActiveMode('writing')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
            activeMode === 'writing'
              ? 'bg-[#F79009] text-white shadow-md'
              : 'text-[#5A6478] hover:bg-amber-50 dark:hover:bg-amber-950/40 dark:text-[#CBD5E1]'
          }`}
        >
          <span>✎ AI Writing</span>
        </button>

        <button
          onClick={() => setActiveMode('speaking')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
            activeMode === 'speaking'
              ? 'bg-[#12B76A] text-white shadow-md'
              : 'text-[#5A6478] hover:bg-emerald-50 dark:hover:bg-emerald-950/40 dark:text-[#CBD5E1]'
          }`}
        >
          <span>🎙 AI Speaking</span>
        </button>
      </div>

      {/* Mode Content Views */}
      {activeMode === 'dictation' ? (
        <DictationExercise
          segments={currentLesson?.dictationSegments || []}
          youtubeUrl={course.youtubeUrl}
          videoTitle={course.title}
          onFinishDictation={() => setActiveMode('shadowing')}
        />
      ) : activeMode === 'speaking' ? (
        <SpeakingExercise
          prompt={currentLesson?.speakingPrompt}
          youtubeVideoId={course.youtubeVideoId}
          startSeconds={currentLesson?.startSeconds}
          onFinishSpeaking={() => {
            alert('🎉 Congratulations! You completed all 6 learning modes for this lesson!');
            setActiveMode('theory');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Video Player & Timeline */}
          <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-20">
            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-lg border border-slate-800">
              <iframe
                src={`https://www.youtube.com/embed/${course.youtubeVideoId}?start=${currentLesson?.startSeconds || 0}&autoplay=0`}
                title="Course Video Lesson"
                className="w-full h-full border-none"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#1E293B] border border-[#E4E8F0] dark:border-[#334155] shadow-sm space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#2E68FF]">
                  Lesson {activeLessonIndex + 1} of {course.lessons.length}
                </span>
                <span className="text-[11px] font-semibold text-[#5A6478] dark:text-[#94A3B8]">
                  ⏱ {currentLesson?.videoStartTime} - {currentLesson?.videoEndTime}
                </span>
              </div>
              <h3 className="font-bold text-base text-[#1B1F2E] dark:text-white line-clamp-2">
                {currentLesson?.title}
              </h3>
            </div>

            {/* Lesson Timeline Drawer */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#1E293B] border border-[#E4E8F0] dark:border-[#334155] shadow-sm space-y-3 max-h-60 overflow-y-auto">
              <h4 className="font-extrabold text-xs text-[#1B1F2E] dark:text-white uppercase tracking-wider">
                Course Lessons ({course.lessons.length} modules)
              </h4>
              <div className="space-y-2">
                {course.lessons.map((les, lIdx) => (
                  <button
                    key={les.id || lIdx}
                    onClick={() => setActiveLessonIndex(lIdx)}
                    className={`w-full p-2.5 rounded-xl text-left font-semibold text-xs flex items-center justify-between transition-colors ${
                      lIdx === activeLessonIndex
                        ? 'bg-blue-50 dark:bg-blue-950 text-[#2E68FF] border border-blue-200 dark:border-blue-800'
                        : 'bg-[#F8FAFC] dark:bg-[#0F172A] text-[#1B1F2E] dark:text-white hover:bg-slate-100'
                    }`}
                  >
                    <span className="truncate">{lIdx + 1}. {les.title}</span>
                    <span className="text-[10px] text-slate-400 shrink-0 ml-2">{les.videoStartTime}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Mode Active Component */}
          <div className="lg:col-span-7">
            {activeMode === 'theory' && currentLesson && (
              <TheoryReader
                lesson={currentLesson}
                onCompleteTheory={() => setActiveMode('quiz')}
                onStartQuiz={() => setActiveMode('quiz')}
              />
            )}

            {activeMode === 'quiz' && currentLesson && (
              <QuizPlayer
                lesson={currentLesson}
                onFinishQuiz={() => setActiveMode('dictation')}
              />
            )}

            {activeMode === 'shadowing' && (
              <ShadowingExercise
                lines={currentLesson?.shadowingLines || []}
                onFinishShadowing={() => setActiveMode('writing')}
              />
            )}

            {activeMode === 'writing' && (
              <WritingExercise
                prompt={currentLesson?.writingPrompt}
                onFinishWriting={() => setActiveMode('speaking')}
              />
            )}
          </div>

        </div>
      )}

    </div>
  );
};
