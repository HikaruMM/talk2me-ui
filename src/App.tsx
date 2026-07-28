import React, { useState, useEffect } from 'react';
import { Course, Category, Flashcard } from './types';
import { INITIAL_CATEGORIES, INITIAL_COURSES, MOCK_FLASHCARDS } from './data/mockCourses';
import { HeaderTopNav } from './components/HeaderTopNav';
import { HeroSection } from './components/HeroSection';
import { CategoryFilter } from './components/CategoryFilter';
import { CourseCard } from './components/CourseCard';
import { CreateCourseModal } from './components/CreateCourseModal';
import { TheoryReader } from './components/TheoryReader';
import { QuizPlayer } from './components/QuizPlayer';
import { DictationExercise } from './components/DictationExercise';
import { ShadowingExercise } from './components/ShadowingExercise';
import { WritingExercise } from './components/WritingExercise';
import { SpeakingExercise } from './components/SpeakingExercise';
import { FlashcardDeck } from './components/FlashcardDeck';
import { ProgressAnalytics } from './components/ProgressAnalytics';
import { CommunitySection } from './components/CommunitySection';
import { SettingsPage } from './components/SettingsPage';
import { FAQSection } from './components/FAQSection';
import { FooterSection } from './components/FooterSection';
import { 
  ArrowLeft, 
  Sparkles, 
  BookOpen, 
  CheckCircle2, 
  Plus, 
  Search, 
  Layers, 
  BarChart3, 
  Users,
  Video,
  ChevronDown
} from 'lucide-react';


export function App() {

  const [currentTab, setCurrentTab] = useState<string>('home');
  const [darkMode, setDarkMode] = useState<boolean>(false);

  // State collections with localStorage backup
  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('t2m_categories');
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  const [courses, setCourses] = useState<Course[]>(() => {
    const saved = localStorage.getItem('t2m_courses');
    return saved ? JSON.parse(saved) : INITIAL_COURSES;
  });

  const [flashcards, setFlashcards] = useState<Flashcard[]>(() => {
    const saved = localStorage.getItem('t2m_flashcards');
    return saved ? JSON.parse(saved) : MOCK_FLASHCARDS;
  });

  const [streakCount, setStreakCount] = useState<number>(5);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [visibleLimit, setVisibleLimit] = useState<number>(6);

  // Course detail active state
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);
  const [activeLessonIndex, setActiveLessonIndex] = useState<number>(0);
  const [activeMode, setActiveMode] = useState<'theory' | 'quiz' | 'dictation' | 'shadowing' | 'writing' | 'speaking'>('theory');

  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [prefillUrl, setPrefillUrl] = useState<string>('');

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('t2m_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('t2m_courses', JSON.stringify(courses));
  }, [courses]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Open course creation modal
  const handleOpenCreateModal = (url?: string) => {
    if (url) setPrefillUrl(url);
    else setPrefillUrl('');
    setIsCreateModalOpen(true);
  };

  // Add new course
  const handleCourseCreated = (newCourse: Course) => {
    setCourses((prev) => [newCourse, ...prev]);
    setActiveCourse(newCourse);
    setActiveLessonIndex(0);
    setActiveMode('theory');
    setCurrentTab('course-detail');
  };

  // Add custom category
  const handleCreateCategory = (name: string) => {
    const newCat: Category = {
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name,
      color: '#2E68FF',
      badgeBg: 'bg-blue-100 dark:bg-blue-900/40',
      badgeText: 'text-blue-600 dark:text-blue-400',
    };
    setCategories((prev) => [...prev, newCat]);
  };

  // Filter courses by category & search term
  const filteredCourses = courses.filter((c) => {
    const matchesCategory = selectedCategory === 'all' || c.categoryId === selectedCategory || c.category.toLowerCase() === selectedCategory.toLowerCase();
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query || c.title.toLowerCase().includes(query) || c.description.toLowerCase().includes(query) || c.category.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  const displayedCourses = filteredCourses.slice(0, visibleLimit);

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F8FB] dark:bg-[#0F172A] text-[#1B1F2E] dark:text-[#F1F5F9] transition-colors duration-200">
      
      {/* Top Navigation Bar (Replacing Sidebar as requested) */}
      <HeaderTopNav
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          if (tab !== 'course-detail') setActiveCourse(null);
          setCurrentTab(tab);
        }}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onOpenCreateModal={handleOpenCreateModal}
        streakCount={streakCount}
      />

      {/* Main Page Content Body */}
      <main className="flex-1">

        {/* VIEW 1: HOME PAGE */}
        {currentTab === 'home' && (
          <div className="space-y-16 pb-16">
            
            {/* Hero Section */}
            <HeroSection
              onOpenCreateModal={handleOpenCreateModal}
              onExploreCourses={() => setCurrentTab('courses')}
            />

            {/* Courses Section with Category Filters & Search */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
              <CategoryFilter
                categories={categories}
                selectedCategory={selectedCategory}
                onSelectCategory={(id) => {
                  setSelectedCategory(id);
                  setVisibleLimit(6);
                }}
                searchQuery={searchQuery}
                onSearchChange={(q) => {
                  setSearchQuery(q);
                  setVisibleLimit(6);
                }}
              />

              {/* Course Cards Grid */}
              {displayedCourses.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-[#1E293B] rounded-3xl border border-[#E4E8F0] dark:border-[#334155] p-8 space-y-4">
                  <p className="text-lg font-extrabold text-[#1B1F2E] dark:text-white">Không tìm thấy khóa học phù hợp</p>
                  <p className="text-xs text-[#5A6478] dark:text-[#CBD5E1]">
                    Thử tìm kiếm với từ khóa khác hoặc bấm nút xem tất cả bên dưới.
                  </p>
                  <button
                    onClick={() => {
                      setSelectedCategory('all');
                      setSearchQuery('');
                      setVisibleLimit(6);
                    }}
                    className="px-6 py-2.5 rounded-full bg-[#2E68FF] text-white text-xs font-bold hover:bg-blue-600 transition-colors shadow-sm"
                  >
                    Xem Tất Cả Khóa Học
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {displayedCourses.map((course) => (
                      <CourseCard
                        key={course.id}
                        course={course}
                        onSelectCourse={(c) => {
                          setActiveCourse(c);
                          setActiveLessonIndex(0);
                          setActiveMode('theory');
                          setCurrentTab('course-detail');
                        }}
                      />
                    ))}
                  </div>

                  {/* Load More Button */}
                  {filteredCourses.length > visibleLimit && (
                    <div className="text-center pt-6">
                      <button
                        onClick={() => setVisibleLimit((prev) => prev + 6)}
                        className="px-8 py-3.5 rounded-full bg-white dark:bg-[#1E293B] text-[#2E68FF] dark:text-[#5B8CFF] border border-[#2E68FF]/30 dark:border-[#5B8CFF]/30 font-extrabold text-xs uppercase tracking-wider shadow-md hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:scale-105 transition-all inline-flex items-center gap-2"
                      >
                        <span>Load More Courses ({filteredCourses.length - visibleLimit} more)</span>
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </>
              )}
            </section>

            {/* FAQ */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <FAQSection />
            </section>

          </div>
        )}

        {/* VIEW 2: ALL COURSES LIBRARY */}
        {currentTab === 'courses' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-extrabold text-[#1B1F2E] dark:text-white">
                  My Courses
                </h1>
                <p className="text-xs sm:text-sm text-[#5A6478] dark:text-[#CBD5E1]">
                  Manage and study courses generated by AI from YouTube or saved in your library
                </p>
              </div>

              {/* Search & Create Bar */}
              <div className="flex items-center gap-3">
                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#95A0B4]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setVisibleLimit(6);
                    }}
                    placeholder="Search courses..."
                    className="w-full pl-10 pr-4 py-2.5 text-xs rounded-full bg-white dark:bg-[#1E293B] border border-[#E4E8F0] dark:border-[#334155] focus:ring-2 focus:ring-[#2E68FF] focus:outline-none"
                  />
                </div>

                <button
                  onClick={() => handleOpenCreateModal()}
                  className="px-5 py-2.5 rounded-full bg-[#2E68FF] text-white text-xs font-bold flex items-center gap-2 shadow-sm shrink-0 hover:bg-blue-600 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Course</span>
                </button>
              </div>
            </div>

            {/* Category Filter Pills (Scrollable Bar) */}
            <div className="flex items-center gap-2 overflow-x-auto py-2 no-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setVisibleLimit(6);
                  }}
                  className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                    selectedCategory === cat.id
                      ? 'bg-[#2E68FF] text-white'
                      : 'bg-white dark:bg-[#1E293B] text-[#5A6478] dark:text-[#CBD5E1] border border-[#E4E8F0] dark:border-[#334155]'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Courses Grid */}
            {displayedCourses.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-[#1E293B] rounded-3xl border border-[#E4E8F0] dark:border-[#334155] p-8 space-y-3">
                <p className="text-lg font-extrabold text-[#1B1F2E] dark:text-white">No courses found</p>
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSearchQuery('');
                    setVisibleLimit(6);
                  }}
                  className="px-5 py-2 rounded-full bg-[#2E68FF] text-white text-xs font-bold"
                >
                  View All
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {displayedCourses.map((course) => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      onSelectCourse={(c) => {
                        setActiveCourse(c);
                        setActiveLessonIndex(0);
                        setActiveMode('theory');
                        setCurrentTab('course-detail');
                      }}
                    />
                  ))}
                </div>

                {/* Load More Button */}
                {filteredCourses.length > visibleLimit && (
                  <div className="text-center pt-6">
                    <button
                      onClick={() => setVisibleLimit((prev) => prev + 6)}
                      className="px-8 py-3.5 rounded-full bg-white dark:bg-[#1E293B] text-[#2E68FF] dark:text-[#5B8CFF] border border-[#2E68FF]/30 dark:border-[#5B8CFF]/30 font-extrabold text-xs uppercase tracking-wider shadow-md hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:scale-105 transition-all inline-flex items-center gap-2"
                    >
                      <span>Load More Courses ({filteredCourses.length - visibleLimit} more)</span>
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* VIEW 3: FLASHCARDS SRS */}
        {currentTab === 'flashcards' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
            <FlashcardDeck
              cards={flashcards}
              onReviewFinished={() => {
                alert('Congratulations! Review session completed!');
                setCurrentTab('home');
              }}
            />
          </div>
        )}

        {/* VIEW 4: PROGRESS & ANALYTICS */}
        {currentTab === 'progress' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
            <div>
              <h1 className="text-3xl font-extrabold text-[#1B1F2E] dark:text-white">
                Learning Analytics & Progress
              </h1>
              <p className="text-xs sm:text-sm text-[#5A6478]">
                Track study time, quiz accuracy, and lesson completion streak
              </p>
            </div>

            <ProgressAnalytics />
          </div>
        )}

        {/* VIEW 5: COMMUNITY */}
        {currentTab === 'community' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
            <CommunitySection
              onSelectCourse={(courseId) => {
                const targetCourse = courses.find(c => c.id === courseId) || courses[0];
                if (targetCourse) {
                  setActiveCourse(targetCourse);
                  setActiveLessonIndex(0);
                  setActiveMode('theory');
                  setCurrentTab('course-detail');
                }
              }}
              onOpenFlashcards={() => {
                setCurrentTab('flashcards');
              }}
            />
          </div>
        )}

        {/* VIEW: SETTINGS FOR OPENROUTER BYOK */}
        {currentTab === 'settings' && (
          <SettingsPage onBack={() => setCurrentTab('home')} />
        )}

        {/* VIEW 6: COURSE DETAIL & INTERACTIVE LEARNING ENGINE */}
        {currentTab === 'course-detail' && activeCourse && (
          <div className="max-w-[1680px] w-full mx-auto px-4 sm:px-6 lg:px-10 py-6 space-y-4">
            
            {/* Top Navigation Bar: Left (Back Button) & Right (Course Info & AI Action) */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Left: Back to Course Library */}
              <button
                onClick={() => {
                  setActiveCourse(null);
                  setCurrentTab('courses');
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white dark:bg-[#1E293B] border border-[#E4E8F0] dark:border-[#334155] shadow-2xs text-xs font-bold text-[#2E68FF] hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Course Library</span>
              </button>

              {/* Right: Course Meta Badges & Action */}
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="px-3 py-1.5 rounded-2xl bg-blue-100 dark:bg-blue-950/80 text-[#2E68FF] font-extrabold text-xs">
                  {activeCourse.category}
                </span>

                <span className="text-slate-500 dark:text-slate-400 text-xs font-bold px-1">
                  Channel: {activeCourse.channelName || 'YouTube'}
                </span>

                <button
                  onClick={() => handleOpenCreateModal(activeCourse.youtubeUrl)}
                  className="px-4 py-2 rounded-2xl bg-white dark:bg-[#1E293B] border border-[#E4E8F0] dark:border-[#334155] text-[#1B1F2E] dark:text-white text-xs font-bold flex items-center gap-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-2xs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#2E68FF]" />
                  <span>Re-generate with AI</span>
                </button>
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
                <span>✓ Quiz ({activeCourse.lessons[activeLessonIndex]?.quizQuestions?.length || 0})</span>
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

            {/* DEDICATED FULL-WIDTH WORKSPACES FOR DICTATION & SPEAKING MODES */}
            {activeMode === 'dictation' ? (
              <DictationExercise
                segments={activeCourse.lessons[activeLessonIndex]?.dictationSegments || []}
                youtubeUrl={activeCourse.youtubeUrl}
                videoTitle={activeCourse.title}
                onFinishDictation={() => setActiveMode('shadowing')}
              />
            ) : activeMode === 'speaking' ? (
              <SpeakingExercise
                prompt={activeCourse.lessons[activeLessonIndex]?.speakingPrompt}
                youtubeVideoId={activeCourse.youtubeVideoId}
                startSeconds={activeCourse.lessons[activeLessonIndex]?.startSeconds}
                onFinishSpeaking={() => {
                  alert('🎉 Congratulations! You completed all 6 learning modes for this lesson!');
                  setActiveMode('theory');
                }}
              />
            ) : (
              /* SPLIT DUAL LAYOUT FOR OTHER MODES (Theory, Quiz, Shadowing, Writing) */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left Column (5 cols): Sticky Video Player & Lesson Selector */}
                <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-20">
                  {/* Video Embed */}
                  <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-lg border border-slate-800">
                    <iframe
                      src={`https://www.youtube.com/embed/${activeCourse.youtubeVideoId}?start=${activeCourse.lessons[activeLessonIndex]?.startSeconds || 0}&autoplay=0`}
                      title="Course Video Lesson"
                      className="w-full h-full border-none"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>

                  {/* Current Lesson Header */}
                  <div className="p-4 rounded-2xl bg-white dark:bg-[#1E293B] border border-[#E4E8F0] dark:border-[#334155] shadow-sm space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#2E68FF]">
                        Lesson {activeLessonIndex + 1} of {activeCourse.lessons.length}
                      </span>
                      <span className="text-[11px] font-semibold text-[#5A6478] dark:text-[#94A3B8]">
                        ⏱ {activeCourse.lessons[activeLessonIndex]?.videoStartTime} - {activeCourse.lessons[activeLessonIndex]?.videoEndTime}
                      </span>
                    </div>
                    <h3 className="font-bold text-base text-[#1B1F2E] dark:text-white line-clamp-2">
                      {activeCourse.lessons[activeLessonIndex]?.title}
                    </h3>
                  </div>

                  {/* Compact Scrollable Lesson Timeline */}
                  <div className="p-4 rounded-2xl bg-white dark:bg-[#1E293B] border border-[#E4E8F0] dark:border-[#334155] shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-extrabold text-xs text-[#1B1F2E] dark:text-white uppercase tracking-wider">
                        Course Lessons Timeline ({activeCourse.lessons.length} modules)
                      </h4>
                    </div>

                    <div className="space-y-1.5 max-h-[260px] overflow-y-auto pr-1">
                      {activeCourse.lessons.map((les, idx) => {
                        const isSelected = activeLessonIndex === idx;
                        return (
                          <div
                            key={les.id}
                            onClick={() => setActiveLessonIndex(idx)}
                            className={`p-3 rounded-xl text-xs font-semibold cursor-pointer transition-all space-y-1 ${
                              isSelected
                                ? 'bg-[#EAF1FF] dark:bg-[#1A2540] border-2 border-[#2E68FF] text-[#2E68FF] shadow-xs'
                                : 'bg-[#F1F4F9] dark:bg-[#273449] border border-[#E4E8F0] dark:border-[#334155] text-[#1B1F2E] dark:text-[#F1F5F9] hover:border-[#2E68FF]/40'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-[11px]">Lesson {idx + 1}</span>
                              <span className="text-[10px] text-[#95A0B4]">{les.videoStartTime} - {les.videoEndTime}</span>
                            </div>
                            <p className="line-clamp-1 text-xs">{les.title}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Right Column (7 cols): Active Exercise */}
                <div className="lg:col-span-7 space-y-4">
                  <div>
                    {activeMode === 'theory' && (
                      <TheoryReader
                        lesson={activeCourse.lessons[activeLessonIndex]}
                        onCompleteTheory={() => setActiveMode('quiz')}
                        onStartQuiz={() => setActiveMode('quiz')}
                      />
                    )}

                    {activeMode === 'quiz' && (
                      <QuizPlayer
                        lesson={activeCourse.lessons[activeLessonIndex]}
                        onFinishQuiz={(score) => {
                          setActiveMode('dictation');
                        }}
                      />
                    )}

                    {activeMode === 'shadowing' && (
                      <ShadowingExercise
                        lines={activeCourse.lessons[activeLessonIndex]?.shadowingLines || []}
                        onFinishShadowing={() => setActiveMode('writing')}
                      />
                    )}

                    {activeMode === 'writing' && (
                      <WritingExercise
                        prompt={activeCourse.lessons[activeLessonIndex]?.writingPrompt}
                        onFinishWriting={() => setActiveMode('speaking')}
                      />
                    )}
                  </div>
                </div>

              </div>
            )}

          </div>
        )}

      </main>

      {/* Footer Section */}
      <FooterSection />

      {/* AI Course Creator Modal */}
      <CreateCourseModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        categories={categories}
        onCourseCreated={handleCourseCreated}
        prefillUrl={prefillUrl}
        onCreateCategory={handleCreateCategory}
      />

    </div>
  );
}

export default App;

