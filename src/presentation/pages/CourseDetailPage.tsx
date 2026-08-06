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
import { ArrowLeft, Sparkles, Trash2, Video } from 'lucide-react';
import { useDeleteCourseMutation } from '../../application/queries/useCoursesQuery';
import { useAuth } from '../../application/hooks/useAuth';
import { useYoutubeSegmentPlayer } from '../hooks/useYoutubeSegmentPlayer';

interface CourseDetailPageProps {
  course: Course;
  onBack: () => void;
  onOpenCreateModal?: (url?: string) => void;
  onDeleteCourse?: (courseId: string) => void;
}

export const CourseDetailPage: React.FC<CourseDetailPageProps> = ({
  course,
  onBack,
  onOpenCreateModal,
  onDeleteCourse,
}) => {
  const { user } = useAuth();
  const [activeLessonIndex, setActiveLessonIndex] = useState(0);
  const [activeMode, setActiveMode] = useState<'theory' | 'quiz' | 'dictation' | 'shadowing' | 'writing' | 'speaking'>('theory');
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const deleteMutation = useDeleteCourseMutation();
  // Controls the Theory tab's left-column video — vocabulary/grammar "listen" buttons seek
  // this same visible player instead of spawning a second, separate one.
  const { iframeRef: theoryVideoRef, playSegment: playTheorySegment } = useYoutubeSegmentPlayer(course.youtubeVideoId);

  const canDelete = Boolean(user && (onDeleteCourse || (course.userId && course.userId === user.id)));

  const handleDeleteCourse = async () => {
    if (!showConfirmDelete) {
      setShowConfirmDelete(true);
      return;
    }
    try {
      if (onDeleteCourse) {
        onDeleteCourse(course.id);
      } else {
        await deleteMutation.mutateAsync(course.id);
      }
      onBack();
    } catch (err) {
      console.error('Delete course failed:', err);
    }
  };

  const currentLesson = course.lessons[activeLessonIndex] || course.lessons[0];

  const isModeDone = (mode: string) => Boolean(currentLesson?.completedModes?.includes(mode as any));

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

          {canDelete && (
            <button
              onClick={handleDeleteCourse}
              onMouseLeave={() => setShowConfirmDelete(false)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs ${
                showConfirmDelete
                  ? 'bg-red-600 text-white animate-pulse'
                  : 'bg-white dark:bg-[#1E293B] border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40'
              }`}
              title="Xóa khóa học này"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{showConfirmDelete ? 'Xác nhận xóa?' : 'Xóa khóa học'}</span>
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
          {isModeDone('theory') && <span className="text-emerald-400">✓</span>}
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
          {isModeDone('quiz') && <span className="text-emerald-400">✓</span>}
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
          {isModeDone('dictation') && <span className="text-emerald-400">✓</span>}
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
          {isModeDone('shadowing') && <span className="text-emerald-400">✓</span>}
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
          {isModeDone('writing') && <span className="text-emerald-400">✓</span>}
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
          {isModeDone('speaking') && <span className="text-emerald-400">✓</span>}
        </button>
      </div>

      {/* Mode Content Views */}
      {activeMode === 'dictation' ? (
        <DictationExercise
          courseId={course.id}
          lessonId={currentLesson?.id}
          progress={currentLesson?.modeProgress?.dictation}
          segments={currentLesson?.dictationSegments || []}
          youtubeVideoId={course.youtubeVideoId}
          videoTitle={course.title}
          onFinishDictation={() => setActiveMode('shadowing')}
        />
      ) : activeMode === 'speaking' ? (
        <SpeakingExercise
          courseId={course.id}
          lessonId={currentLesson?.id}
          progress={currentLesson?.modeProgress?.speaking}
          prompt={currentLesson?.speakingPrompt}
          youtubeVideoId={course.youtubeVideoId}
          startSeconds={currentLesson?.startSeconds}
          onFinishSpeaking={() => {
            alert('🎉 Congratulations! You completed all 6 learning modes for this lesson!');
            setActiveMode('theory');
          }}
        />
      ) : activeMode === 'shadowing' ? (
        <ShadowingExercise
          courseId={course.id}
          lessonId={currentLesson?.id}
          progress={currentLesson?.modeProgress?.shadowing}
          youtubeVideoId={course.youtubeVideoId}
          lines={currentLesson?.shadowingLines || []}
          onFinishShadowing={() => setActiveMode('writing')}
        />
      ) : activeMode === 'theory' ? (
        /* ── Theory: video always visible ── */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Video Player & Timeline */}
          <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-20">
            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-lg border border-slate-800">
              <iframe
                ref={theoryVideoRef}
                src={`https://www.youtube.com/embed/${course.youtubeVideoId}?start=${currentLesson?.startSeconds || 0}&autoplay=0&enablejsapi=1`}
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

          {/* Right Column: Theory Content */}
          <div className="lg:col-span-7">
            {currentLesson && (
              <TheoryReader
                lesson={currentLesson}
                courseId={course.id}
                lessonId={currentLesson.id}
                onPlaySegment={playTheorySegment}
                onCompleteTheory={() => setActiveMode('quiz')}
                onStartQuiz={() => setActiveMode('quiz')}
              />
            )}
          </div>

        </div>
      ) : (
        /* ── Quiz / Writing: video toggle (default hidden) ── */
        <div className="space-y-4">
          {/* Video toggle bar */}
          <div className="p-3 rounded-2xl bg-white dark:bg-[#1E293B] border border-[#E4E8F0] dark:border-[#334155] shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full font-extrabold text-xs ${
                activeMode === 'quiz'
                  ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                  : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
              }`}>
                {activeMode === 'quiz' ? '✓ Quiz' : '✎ AI Writing'}
              </span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Lesson {activeLessonIndex + 1}: {currentLesson?.title}
              </span>
            </div>
            <button
              onClick={() => setShowVideo(!showVideo)}
              className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border transition-colors ${
                activeMode === 'quiz'
                  ? 'text-blue-600 hover:text-blue-700 bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800'
                  : 'text-amber-600 hover:text-amber-700 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>{showVideo ? 'Ẩn Video' : 'Hiện Video bài học'}</span>
            </button>
          </div>

          <div className={`grid grid-cols-1 ${showVideo ? 'lg:grid-cols-12' : ''} gap-8 items-start`}>
            
            {/* Left Column: Video Player & Timeline (conditionally visible) */}
            {showVideo && (
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
            )}

            {/* Right Column: Mode Active Component */}
            <div className={showVideo ? 'lg:col-span-7' : ''}>
              {activeMode === 'quiz' && currentLesson && (
                <QuizPlayer
                  lesson={currentLesson}
                  courseId={course.id}
                  lessonId={currentLesson.id}
                  onFinishQuiz={() => setActiveMode('dictation')}
                />
              )}

              {activeMode === 'writing' && (
                <WritingExercise
                  courseId={course.id}
                  lessonId={currentLesson?.id}
                  progress={currentLesson?.modeProgress?.writing}
                  prompt={currentLesson?.writingPrompt}
                  onFinishWriting={() => setActiveMode('speaking')}
                />
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
