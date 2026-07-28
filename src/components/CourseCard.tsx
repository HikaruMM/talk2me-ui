import React from 'react';
import { Course } from '../types';
import { Play, BookOpen, CheckCircle, Clock } from 'lucide-react';

interface CourseCardProps {
  course: Course;
  onSelectCourse: (course: Course) => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course, onSelectCourse }) => {
  return (
    <div 
      onClick={() => onSelectCourse(course)}
      className="group bg-white dark:bg-[#1E293B] rounded-3xl p-4 border border-[#E4E8F0] dark:border-[#334155] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between"
    >
      <div>
        {/* Thumbnail & Badge */}
        <div className="relative aspect-[16/10] rounded-2xl overflow-hidden mb-4 bg-slate-100 dark:bg-slate-800">
          <img
            src={course.thumbnailUrl}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          
          {/* Overlay Play Button on Hover */}
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-white text-[#2E68FF] flex items-center justify-center shadow-lg">
              <Play className="w-5 h-5 fill-[#2E68FF] ml-0.5" />
            </div>
          </div>

          {/* Top Gold Badge Tag for Topic/Subject */}
          <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-amber-400 text-slate-950 font-extrabold text-[11px] shadow-md tracking-tight">
            {course.category}
          </div>

          {/* Progress Bar overlay if started */}
          {course.progressPercent > 0 && (
            <div className="absolute bottom-0 inset-x-0 h-1.5 bg-black/40">
              <div 
                className="h-full bg-[#2E68FF] transition-all" 
                style={{ width: `${course.progressPercent}%` }}
              />
            </div>
          )}
        </div>

        {/* Channel & Duration Row */}
        <div className="flex items-center justify-between text-xs font-semibold text-[#5A6478] dark:text-[#CBD5E1] mb-2 px-1">
          <span className="text-[#5A6478] dark:text-[#CBD5E1] font-medium truncate max-w-[170px]">
            {course.channelName || 'YouTube Course'}
          </span>
          <div className="flex items-center gap-1 shrink-0 font-medium text-slate-500 dark:text-slate-400 text-[11px]">
            <Clock className="w-3.5 h-3.5 text-[#2E68FF]" />
            <span>{course.durationText || '15:30'}</span>
          </div>
        </div>

        {/* Course Title */}
        <h3 className="font-bold text-base text-[#1B1F2E] dark:text-white line-clamp-2 mb-4 group-hover:text-[#2E68FF] transition-colors px-1 leading-snug">
          {course.title}
        </h3>
      </div>

      {/* Action Button */}
      <button 
        onClick={(e) => {
          e.stopPropagation();
          onSelectCourse(course);
        }}
        className="w-full py-3 rounded-2xl bg-[#F1F4F9] dark:bg-[#273449] hover:bg-[#2E68FF] hover:text-white dark:hover:bg-[#2E68FF] text-[#1B1F2E] dark:text-white font-bold text-xs tracking-wide uppercase transition-all duration-200 shadow-sm flex items-center justify-center gap-2"
      >
        {course.progressPercent > 0 ? (
          <>
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <span>Continue ({course.progressPercent}%)</span>
          </>
        ) : (
          <>
            <BookOpen className="w-4 h-4" />
            <span>Start Learning</span>
          </>
        )}
      </button>
    </div>
  );
};
