import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { Course, UserProfile } from './core/entities';
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
import { useCoursesQuery, useDeleteCourseMutation } from './application/queries/useCoursesQuery';
import { getCourseDetail, getDueFlashcardCount } from './infrastructure/api/talk2meApi';
import { HeaderTopNav, FooterSection, BottomNav } from './presentation/layout';
import { AuthModal, AuthRequirementModal } from './presentation/components/auth';
import { CreateCourseModal } from './presentation/components/course';
import { Toast } from './presentation/components/common';
import {
  HomePage,
  CourseDetailPage,
  FlashcardsPage,
  AnalyticsPage,
  CommunityPage,
  SettingsPage,
  AuthPage,
  CoursesPage,
  NotificationsPage
} from './presentation/pages';

function AppContent() {
  const { darkMode, setDarkMode } = useTheme();
  const { user, login, logout } = useAuth();
  const { publicCourses, userCourses, categories, createCategory } = useCourses();
  const navigate = useNavigate();
  const deleteCourseMutation = useDeleteCourseMutation();

  const [currentTab, setCurrentTab] = useState<string>('home');
  const [streakCount] = useState<number>(5);
  const [dueCount, setDueCount] = useState<number>(0);

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
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Real, server-backed courses
  const { data: myCourses = [] } = useCoursesQuery(selectedCategory, searchQuery);

  useEffect(() => {
    if (!user) {
      setDueCount(0);
      return;
    }
    getDueFlashcardCount()
      .then((res) => setDueCount(res.count))
      .catch(() => setDueCount(0));
  }, [user]);

  const handleDeleteCourse = async (target: Course | string) => {
    const courseId = typeof target === 'string' ? target : target.id;
    try {
      await deleteCourseMutation.mutateAsync(courseId);
      if (activeCourse?.id === courseId) {
        setActiveCourse(null);
      }
      setToastMessage('Đã xóa khóa học thành công.');
    } catch (err: any) {
      console.error('Failed to delete course:', err);
      setToastMessage(err.message || 'Không thể xóa khóa học.');
    }
  };

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

  const handleCourseQueued = () => {
    setIsCreateModalOpen(false);
    setCurrentTab('courses');
    navigate('/courses');
    setToastMessage('Đang tạo khoá học... Kết quả sẽ xuất hiện trong Khoá học của bạn.');
  };

  const handleSelectMyCourse = async (course: Course) => {
    if (course.isCustomGenerated) {
      try {
        const full = await getCourseDetail(course.id);
        setActiveCourse(full);
      } catch (err) {
        console.error('Failed to load course detail:', err);
        return;
      }
    } else {
      setActiveCourse(course);
    }
    setCurrentTab('course-detail');
  };

  const handleTabChange = (tab: string) => {
    if (tab === 'progress' || tab === 'settings') {
      requireAuth(
        () => {
          setActiveCourse(null);
          setCurrentTab(tab);
          navigate(tab === 'progress' ? '/progress' : '/settings');
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
  };

  // Filter public demo courses for HomePage
  const filteredPublicCourses = publicCourses.filter((c) => {
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
        setCurrentTab={handleTabChange}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onOpenCreateModal={handleOpenCreateModal}
        streakCount={user ? user.streakDays : streakCount}
        user={user}
        onLogout={handleLogout}
        onOpenAuth={(mode) => handleOpenAuth(mode)}
      />

      {/* Main Page Content Body with React Router Routes */}
      <main className="flex-1 pb-20 xl:pb-0">
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
                  onDeleteCourse={handleDeleteCourse}
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
                  onDeleteCourse={handleDeleteCourse}
                />
              ) : (
                <CoursesPage
                  courses={myCourses}
                  categories={categories.length > 0 ? categories : INITIAL_CATEGORIES}
                  selectedCategory={selectedCategory}
                  onSelectCategory={setSelectedCategory}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  onSelectCourse={handleSelectMyCourse}
                  onCreateCourseClick={handleOpenCreateModal}
                  onDeleteCourse={handleDeleteCourse}
                />
              )
            } 
          />

          {/* FLASHCARDS ROUTE */}
          <Route path="/flashcards" element={<FlashcardsPage />} />

          {/* DEDICATED NOTIFICATIONS ROUTE */}
          <Route path="/notifications" element={<NotificationsPage />} />

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

      {/* Mobile Fixed Bottom Navigation Bar */}
      <BottomNav
        currentTab={currentTab}
        setCurrentTab={handleTabChange}
        dueCount={dueCount}
      />

      {/* Footer Section (Desktop View) */}
      <div className="hidden xl:block">
        <FooterSection />
      </div>

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
        onCourseQueued={handleCourseQueued}
        prefillUrl={prefillUrl}
        onCreateCategory={createCategory}
      />

      {/* Auth Requirement Modal for Protected Features */}
      <AuthRequirementModal
        isOpen={authModal.isOpen}
        featureTitle={authModal.featureTitle}
        featureDescription={authModal.featureDescription}
        onClose={() => setAuthModal({ isOpen: false })}
        onConfirmAuth={(mode) => handleAuthConfirmModal(mode || 'login')}
      />

      {/* Course generation queued / other transient notifications */}
      <Toast message={toastMessage} onDismiss={() => setToastMessage(null)} />

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
