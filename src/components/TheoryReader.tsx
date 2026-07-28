import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Lesson } from '../types';
import { BookOpen, CheckCircle2, ArrowRight, Lightbulb } from 'lucide-react';

interface TheoryReaderProps {
  lesson: Lesson;
  onCompleteTheory: () => void;
  onStartQuiz: () => void;
}

export const TheoryReader: React.FC<TheoryReaderProps> = ({
  lesson,
  onCompleteTheory,
  onStartQuiz,
}) => {
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

      {/* Main Lesson Markdown Content */}
      <div className="prose prose-slate dark:prose-invert max-w-none text-sm sm:text-base leading-relaxed">
        <ReactMarkdown>{lesson.theoryContent}</ReactMarkdown>
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
          onClick={onCompleteTheory}
          className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-[#F1F4F9] dark:bg-[#273449] text-[#1B1F2E] dark:text-white font-bold text-xs uppercase tracking-wide hover:bg-emerald-100 hover:text-emerald-700 transition-colors"
        >
          ✓ Mark as Read
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
