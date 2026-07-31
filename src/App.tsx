import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
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
import { QueryProvider } from './application/providers/QueryProvider';
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
  const { publicCourses, userCourses, addCourse, categories, addCategory } = useCourses();
  const navigate = useNavigate();

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

  // Modal create course
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [prefillUrl, setPrefillUrl] = useState<string>('');

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
    navigate('/');
  };

  const handleOpenCreateModal = (url = '') => {
    requireAuth(
      () => {
        setPrefillUrl(url);
        setIsCreateModalOpen(true);
      },
      'Tạo khóa học AI mới',
      'Đăng nhập tài khoản Talk2Me để hệ thống phân tích video YouTube và sinh ra khóa học cá nhân hóa cho riêng bạn.'
    );
  };

  const handleCourseCreated = (newCourse: Course) => {
    addCourse(newCourse);
    setActiveCourse(newCourse);
    setCurrentTab('course-detail');
    setIsCreateModalOpen(false);
    navigate('/courses');
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

  // Filter public demo courses for HomePage
  const filteredPublicCourses = publicCourses.filter((c) => {
    const matchesCategory = selectedCategory === 'all' || c.categoryId === selectedCategory || c.category.toLowerCase() === selectedCategory.toLowerCase();
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query || c.title.toLowerCase().includes(query) || c.description.toLowerCase().includes(query) || c.category.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  // Filter user-created courses for CoursesPage
  const filteredUserCourses = userCourses.filter((c) => {
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

      {/* Main Page Content Body with React Router Routes */}
      <main className="flex-1">
        <Routes>
          {/* HOME PAGE ROUTE (Displays Platform Public Demo Courses) */}
          <Route 
            path="/" 
            element={
              activeCourse && currentTab === 'home-detail' ? (
                <CourseDetailPage
                  course={activeCourse}
                  onBack={() => {
                    setActiveCourse(null);
                    setCurrentTab('home');
                  }}
                  onOpenCreateModal={handleOpenCreateModal}
                />
              ) : (
                <div className="py-8">
                  <HomePage
                    courses={filteredPublicCourses}
                    categories={categories.length > 0 ? categories : INITIAL_CATEGORIES}
                    selectedCategory={selectedCategory}
                    onSelectCategory={setSelectedCategory}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    onSelectCourse={(courseId) => {
                      const targetCourse = publicCourses.find((c) => c.id === courseId) || publicCourses[0];
                      setActiveCourse(targetCourse);
                      setCurrentTab('home-detail');
                    }}
                    onCreateCourseClick={handleOpenCreateModal}
                  />
                </div>
              )
            } 
          />

          {/* COURSES LIBRARY ROUTE (Displays User Created / Saved Courses) */}
          <Route 
            path="/courses" 
            element={
              activeCourse && currentTab === 'course-detail' ? (
                <CourseDetailPage
                  course={activeCourse}
                  onBack={() => {
                    setActiveCourse(null);
                    setCurrentTab('courses');
                  }}
                  onOpenCreateModal={handleOpenCreateModal}
                />
              ) : (
                <CoursesPage
                  courses={filteredUserCourses}
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
              )
            } 
          />

          {/* FLASHCARDS ROUTE */}
          <Route path="/flashcards" element={<FlashcardsPage />} />

          {/* ANALYTICS / PROGRESS ROUTE */}
          <Route path="/progress" element={<AnalyticsPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />

          {/* COMMUNITY ROUTE */}
          <Route 
            path="/community" 
            element={
              <CommunityPage
                onSelectCourse={(courseId) => {
                  const allCourses = [...userCourses, ...publicCourses];
                  const targetCourse = allCourses.find((c) => c.id === courseId) || allCourses[0];
                  if (targetCourse) {
                    setActiveCourse(targetCourse);
                    navigate('/courses');
                  }
                }}
                onOpenFlashcards={() => navigate('/flashcards')}
              />
            } 
          />

          {/* SETTINGS ROUTE */}
          <Route path="/settings" element={<SettingsPage onBack={() => navigate('/')} />} />

          {/* AUTH ROUTE */}
          <Route 
            path="/auth" 
            element={
              <AuthPage
                initialMode={authInitialMode}
                redirectReason={authRedirectReason}
                onLoginSuccess={handleLoginSuccess}
              />
            } 
          />
        </Routes>
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
    <QueryProvider>
      <ThemeProvider>
        <AuthProvider>
          <CourseProvider>
            <FlashcardProvider>
              <BrowserRouter>
                <AppContent />
              </BrowserRouter>
            </FlashcardProvider>
          </CourseProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryProvider>
  );
}

export default App;
