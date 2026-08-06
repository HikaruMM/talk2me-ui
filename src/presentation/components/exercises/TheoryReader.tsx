import React from 'react';
import ReactMarkdown, { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Lesson } from '../../../core/entities';
import { CheckCircle2, ArrowRight, Lightbulb } from 'lucide-react';
import { updateProgress } from '../../../infrastructure/api/talk2meApi';
import { useYoutubeSegmentPlayer } from '../../hooks/useYoutubeSegmentPlayer';
import { VocabularyTable } from './VocabularyTable';

/* ── Custom Markdown table components for premium styling ── */
const markdownComponents: Components = {
  table: ({ children, ...props }) => (
    <div className="my-6 -mx-2 sm:mx-0 overflow-x-auto rounded-2xl border border-[#E4E8F0] dark:border-[#334155] shadow-sm">
      <table
        {...props}
        className="w-full text-left text-xs sm:text-sm border-collapse min-w-[640px]"
      >
        {children}
      </table>
    </div>
  ),
  thead: ({ children, ...props }) => (
    <thead
      {...props}
      className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/40 dark:to-indigo-950/40 sticky top-0 z-10"
    >
      {children}
    </thead>
  ),
  th: ({ children, ...props }) => (
    <th
      {...props}
      className="px-3 sm:px-4 py-3 font-extrabold text-[11px] sm:text-xs uppercase tracking-wider text-purple-700 dark:text-purple-300 border-b-2 border-purple-200 dark:border-purple-800/60 whitespace-nowrap"
    >
      {children}
    </th>
  ),
  tbody: ({ children, ...props }) => (
    <tbody {...props} className="divide-y divide-[#E4E8F0] dark:divide-[#334155]">
      {children}
    </tbody>
  ),
  tr: ({ children, ...props }) => (
    <tr
      {...props}
      className="transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40 even:bg-slate-50/50 dark:even:bg-slate-800/20"
    >
      {children}
    </tr>
  ),
  td: ({ children, ...props }) => (
    <td
      {...props}
      className="px-3 sm:px-4 py-3 text-[#1B1F2E] dark:text-[#E2E8F0] align-top leading-relaxed"
    >
      {children}
    </td>
  ),
};

interface TheoryReaderProps {
  lesson: Lesson;
  courseId: string;
  lessonId: string;
  youtubeVideoId?: string;
  onCompleteTheory: () => void;
  onStartQuiz: () => void;
}

export const TheoryReader: React.FC<TheoryReaderProps> = ({
  lesson,
  courseId,
  lessonId,
  youtubeVideoId,
  onCompleteTheory,
  onStartQuiz,
}) => {
  const isRead = Boolean(lesson.modeProgress?.theory?.completed);
  const { iframeRef, embedUrl, playSegment } = useYoutubeSegmentPlayer(youtubeVideoId);

  const handleMarkAsRead = () => {
    updateProgress(courseId, lessonId, 'theory', true).catch((err) =>
      console.warn('Không lưu được tiến độ Theory:', err)
    );
    onCompleteTheory();
  };

  return (
    <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 sm:p-8 border border-[#E4E8F0] dark:border-[#334155] shadow-sm space-y-8">
      
      {/* Header Badge */}
      <div className="flex items-center justify-between pb-4 border-b border-[#E4E8F0] dark:border-[#334155]">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-sm">
            📖
          </span>
          <span className="font-bold text-sm text-[#1B1F2E] dark:text-white">
            Theory & Key Concepts
          </span>
        </div>
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-300">
          Lesson {lesson.lessonIndex}
        </span>
      </div>

      {/* Hidden player — only needs to exist so the vocabulary "listen" buttons can seek it,
          no need to be visible for Theory (unlike Shadowing where the video is the focus). */}
      {embedUrl && (
        <iframe
          ref={iframeRef}
          src={embedUrl}
          title="YouTube Video Player"
          className="hidden"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
      )}

      {/* Vocabulary — fixed React table (not LLM-authored Markdown) so every lesson shows
          the exact same layout, with a play button seeking the real video moment. */}
      <VocabularyTable items={lesson.vocabulary || []} onPlay={playSegment} />

      {/* Main Lesson Markdown Content */}
      <div className="prose prose-slate dark:prose-invert max-w-none text-sm sm:text-base leading-relaxed">
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
          {lesson.theoryContent}
        </ReactMarkdown>
      </div>

      {/* Key Takeaways Card */}
      {lesson.keyTakeaways && lesson.keyTakeaways.length > 0 && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 border border-purple-200/60 dark:border-purple-800/40 space-y-3">
          <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300 font-bold text-sm">
            <Lightbulb className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>Key Lesson Takeaways</span>
          </div>
          <ul className="space-y-2 text-xs sm:text-sm text-[#1B1F2E] dark:text-[#F1F5F9]">
            {lesson.keyTakeaways.map((point, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action Footer */}
      <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#E4E8F0] dark:border-[#334155]">
        <button
          onClick={handleMarkAsRead}
          className={`w-full sm:w-auto px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-wide transition-colors ${
            isRead
              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
              : 'bg-[#F1F4F9] dark:bg-[#273449] text-[#1B1F2E] dark:text-white hover:bg-emerald-100 hover:text-emerald-700'
          }`}
        >
          {isRead ? '✓ Đã đọc' : '✓ Mark as Read'}
        </button>

        <button
          onClick={onStartQuiz}
          className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-[#2E68FF] hover:bg-[#1E52DB] text-white font-extrabold text-xs tracking-wide uppercase shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition-all"
        >
          <span>Proceed to Quiz</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
