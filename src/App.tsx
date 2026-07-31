import React, { useState, useEffect } from 'react';
import { Course, Category, UserProfile } from './core/entities';
import { INITIAL_CATEGORIES } from './infrastructure/data/mockCourses';
import { 
  AuthProvider, 
  CourseProvider, 
  FlashcardProvider, 
  ThemeProvider,
  useTheme,
  useAuth,
  useCourses
} from './application';
import { HeaderTopNav, FooterSection } from './presentation/layout';
import { AuthModal, AuthRequirementModal } from './presentation/components/auth';
import { CreateCourseModal } from './presentation/components/course';
import { 
  HomePage, 
  CourseDetailPage, 
  FlashcardsPage, 
  AnalyticsPage, 
  CommunityPage, 
  SettingsPage,
  AuthPage,
  CoursesPage
} from './presentation/pages';

function AppContent() {
  const { darkMode, setDarkMode } = useTheme();
  const { user, login, logout } = useAuth();
  const { courses, addCourse, categories, addCategory } = useCourses();

  const [currentTab, setCurrentTab] = useState<string>('home');
  const [streakCount] = useState<number>(5);

  // Auth requirement modal state
  const [authModal, setAuthModal] = useState<{
    isOpen: boolean;
    featureTitle?: string;
    featureDescription?: string;
    pendingAction?: () => void;
  }>({ isOpen: false });

  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'signup'>('login');
  const [authRedirectReason, setAuthRedirectReason] = useState<string>('');
  const [isAuthPopupOpen, setIsAuthPopupOpen] = useState<boolean>(false);

  // Filtering & course detail active state
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);

  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [prefillUrl, setPrefillUrl] = useState<string>('');

  // Authorization Guard helper
  const requireAuth = (
    action: () => void,
    title = 'Tính năng này yêu cầu đăng nhập',
    description = 'Đăng nhập hoặc đăng ký tài khoản Talk2Me để lưu tiến độ học tập, khởi tạo khóa học AI cá nhân và mở khóa đầy đủ quyền lợi.'
  ) => {
    if (user) {
      action();
    } else {
      setAuthModal({
        isOpen: true,
        featureTitle: title,
        featureDescription: description,
        pendingAction: action,
      });
    }
  };

  const handleOpenAuth = (mode: 'login' | 'signup' = 'login', reason?: string) => {
    setAuthInitialMode(mode);
    setAuthRedirectReason(reason || '');
    setIsAuthPopupOpen(true);
  };

  const handleAuthConfirmModal = (mode: 'login' | 'signup') => {
    const reason = authModal.featureTitle || 'Truy cập tính năng phân quyền';
    setAuthModal({ isOpen: false });
    handleOpenAuth(mode, reason);
  };

  const handleLoginSuccess = (newUser: UserProfile) => {
    login(newUser);
    setIsAuthPopupOpen(false);
    if (authModal.pendingAction) {
      const action = authModal.pendingAction;
      setAuthModal({ isOpen: false });
      action();
    }
  };

  const handleLogout = () => {
    logout();
    setCurrentTab('home');
  };

  const handleOpenCreateModal = (url?: string) => {
    requireAuth(
      () => {
        if (url) setPrefillUrl(url);
        else setPrefillUrl('');
        setIsCreateModalOpen(true);
      },
      'Tạo khóa học AI yêu cầu tài khoản',
      'Đăng nhập để AI khởi tạo nội dung khóa học theo đường dẫn YouTube và đồng bộ dữ liệu bài học vào tài khoản cá nhân của bạn.'
    );
  };

  const handleCourseCreated = (newCourse: Course) => {
    addCourse(newCourse);
    setActiveCourse(newCourse);
    setCurrentTab('course-detail');
  };

  const handleCreateCategory = (name: string) => {
    const newCat: Category = {
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name,
      color: '#2E68FF',
      badgeBg: 'bg-blue-100 dark:bg-blue-900/40',
      badgeText: 'text-blue-600 dark:text-blue-400',
    };
    addCategory(newCat);
  };

  // Filter courses by category & search term
  const filteredCourses = courses.filter((c) => {
    const matchesCategory = selectedCategory === 'all' || c.categoryId === selectedCategory || c.category.toLowerCase() === selectedCategory.toLowerCase();
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query || c.title.toLowerCase().includes(query) || c.description.toLowerCase().includes(query) || c.category.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F8FB] dark:bg-[#0F172A] text-[#1B1F2E] dark:text-[#F1F5F9] transition-colors duration-200">
      
      {/* Top Navigation Bar */}
      <HeaderTopNav
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          if (tab === 'progress' || tab === 'settings') {
            requireAuth(
              () => {
                setActiveCourse(null);
                setCurrentTab(tab);
              },
              tab === 'progress' ? 'Báo cáo tiến độ học tập cá nhân' : 'Cài đặt tài khoản & Key AI',
              tab === 'progress'
                ? 'Vui lòng đăng nhập để theo dõi tổng thời gian học, chuỗi ngày liên tiếp và biểu đồ ghi nhớ cá nhân.'
                : 'Vui lòng đăng nhập để quản lý API Key và thông tin cấu hình tài khoản.'
            );
          } else {
            if (tab !== 'course-detail') setActiveCourse(null);
            setCurrentTab(tab);
          }
        }}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onOpenCreateModal={handleOpenCreateModal}
        streakCount={user ? user.streakDays : streakCount}
        user={user}
        onLogout={handleLogout}
        onOpenAuth={(mode) => handleOpenAuth(mode)}
      />

      {/* Main Page Content Body */}
      <main className="flex-1">

        {/* HOME PAGE */}
        {currentTab === 'home' && (
          <div className="py-8">
            <HomePage
              courses={filteredCourses}
              categories={categories.length > 0 ? categories : INITIAL_CATEGORIES}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onSelectCourse={(courseId) => {
                const targetCourse = courses.find((c) => c.id === courseId) || courses[0];
                setActiveCourse(targetCourse);
                setCurrentTab('course-detail');
              }}
              onCreateCourseClick={handleOpenCreateModal}
            />
          </div>
        )}

        {/* COURSES LIBRARY PAGE */}
        {currentTab === 'courses' && (
          <CoursesPage
            courses={courses}
            categories={categories.length > 0 ? categories : INITIAL_CATEGORIES}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSelectCourse={(course) => {
              setActiveCourse(course);
              setCurrentTab('course-detail');
            }}
            onCreateCourseClick={handleOpenCreateModal}
          />
        )}

        {/* FLASHCARDS PAGE */}
        {currentTab === 'flashcards' && <FlashcardsPage />}

        {/* ANALYTICS PAGE */}
        {currentTab === 'progress' && <AnalyticsPage />}

        {/* COMMUNITY PAGE */}
        {currentTab === 'community' && (
          <CommunityPage
            onSelectCourse={(courseId) => {
              const targetCourse = courses.find((c) => c.id === courseId) || courses[0];
              if (targetCourse) {
                setActiveCourse(targetCourse);
                setCurrentTab('course-detail');
              }
            }}
            onOpenFlashcards={() => setCurrentTab('flashcards')}
          />
        )}

        {/* SETTINGS PAGE */}
        {currentTab === 'settings' && <SettingsPage onBack={() => setCurrentTab('home')} />}

        {/* AUTH PAGE */}
        {currentTab === 'auth' && (
          <AuthPage
            initialMode={authInitialMode}
            redirectReason={authRedirectReason}
            onLoginSuccess={handleLoginSuccess}
          />
        )}

        {/* COURSE DETAIL PAGE */}
        {currentTab === 'course-detail' && activeCourse && (
          <CourseDetailPage
            course={activeCourse}
            onBack={() => {
              setActiveCourse(null);
              setCurrentTab('home');
            }}
            onOpenCreateModal={handleOpenCreateModal}
          />
        )}

      </main>

      {/* Footer Section */}
      <FooterSection />

      {/* Auth Modal Popup */}
      <AuthModal
        isOpen={isAuthPopupOpen}
        onClose={() => setIsAuthPopupOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        redirectReason={authRedirectReason}
        initialMode={authInitialMode}
      />

      {/* AI Course Creator Modal */}
      <CreateCourseModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        categories={categories.length > 0 ? categories : INITIAL_CATEGORIES}
        onCourseCreated={handleCourseCreated}
        prefillUrl={prefillUrl}
        onCreateCategory={handleCreateCategory}
      />

      {/* Auth Requirement Modal for Protected Features */}
      <AuthRequirementModal
        isOpen={authModal.isOpen}
        featureTitle={authModal.featureTitle}
        featureDescription={authModal.featureDescription}
        onClose={() => setAuthModal({ isOpen: false })}
        onConfirmAuth={(mode) => handleAuthConfirmModal(mode || 'login')}
      />

    </div>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CourseProvider>
          <FlashcardProvider>
            <AppContent />
          </FlashcardProvider>
        </CourseProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
