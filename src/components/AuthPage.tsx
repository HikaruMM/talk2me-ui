import React, { useState } from 'react';
import { UserProfile } from '../types';
import { 
  GraduationCap, 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  AlertCircle,
  ArrowLeft,
  Sparkles,
  BookOpen,
  Volume2,
  Award,
  Check
} from 'lucide-react';

interface AuthPageProps {
  initialMode?: 'login' | 'signup';
  onLoginSuccess: (user: UserProfile) => void;
  onCancel?: () => void;
  onBack?: () => void;
  redirectReason?: string;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  initialMode = 'login',
  onLoginSuccess,
  onCancel,
  onBack,
  redirectReason,
}) => {
  const handleGoBack = () => {
    if (onBack) onBack();
    else if (onCancel) onCancel();
  };

  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  
  // Form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Status state
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Handle Login Submit
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Vui lòng nhập đầy đủ Email và Mật khẩu.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const mockUser: UserProfile = {
        id: 'usr_' + Date.now(),
        name: email.split('@')[0] || 'Kỳ Duyên',
        email: email.trim(),
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        role: 'pro',
        createdAt: new Date().toISOString(),
        streakDays: 5,
        savedCourseIds: ['c1', 'c2'],
        completedLessonCount: 12,
      };

      onLoginSuccess(mockUser);
    }, 400);
  };

  // Handle Signup Submit
  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setErrorMessage('Vui lòng điền đầy đủ các thông tin.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Mật khẩu xác nhận không trùng khớp.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const newUser: UserProfile = {
        id: 'usr_' + Date.now(),
        name: fullName.trim(),
        email: email.trim(),
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(fullName)}`,
        role: 'free',
        createdAt: new Date().toISOString(),
        streakDays: 1,
        savedCourseIds: [],
        completedLessonCount: 0,
      };

      onLoginSuccess(newUser);
    }, 500);
  };

  // Quick Demo Login
  const handleDemoLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const demoUser: UserProfile = {
        id: 'usr_demo_888',
        name: 'Kỳ Duyên',
        email: 'kyduyendo22@gmail.com',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        role: 'pro',
        createdAt: '2026-01-10T00:00:00.000Z',
        streakDays: 7,
        savedCourseIds: ['c1', 'c2'],
        completedLessonCount: 18,
      };
      onLoginSuccess(demoUser);
    }, 300);
  };

  // Google Login Simulation
  const handleGoogleLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const googleUser: UserProfile = {
        id: 'usr_google_' + Date.now(),
        name: 'Duyên Do',
        email: 'kyduyen.google@gmail.com',
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        role: 'pro',
        createdAt: new Date().toISOString(),
        streakDays: 12,
        savedCourseIds: ['c1'],
        completedLessonCount: 8,
      };
      onLoginSuccess(googleUser);
    }, 350);
  };

  return (
    <div className="min-h-screen w-full bg-[#EBF0F9] dark:bg-[#0F172A] p-4 sm:p-6 md:p-10 flex items-center justify-center relative overflow-hidden font-sans">
      
      {/* Playful Floating Confetti / Background Dots matching the template */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-10 left-12 w-8 h-8 rounded-full bg-indigo-200/60 blur-xs" />
        <div className="absolute top-24 right-20 w-6 h-6 rounded-full bg-rose-300/70" />
        <div className="absolute bottom-16 left-1/4 w-5 h-5 rounded-full bg-amber-300/80" />
        <div className="absolute bottom-12 right-1/3 w-7 h-7 rounded-full bg-emerald-200/60" />
        <div className="absolute top-1/3 left-6 w-12 h-12 rounded-full bg-blue-100/80" />
        <div className="absolute top-10 right-1/4 w-10 h-10 rounded-full bg-purple-200/50" />
        
        {/* Soft geometric shapes */}
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-blue-400/10 rounded-full blur-2xl" />
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl" />
      </div>

      {/* Back to Home floating action button */}
      <button
        type="button"
        onClick={handleGoBack}
        className="absolute top-6 left-6 z-30 flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 bg-white dark:bg-slate-800 shadow-md px-4 py-2.5 rounded-full border border-slate-200 dark:border-slate-700 transition-transform active:scale-95"
      >
        <ArrowLeft className="w-4 h-4 text-blue-600" />
        <span>Trang chủ</span>
      </button>

      {/* CENTERED SPLIT CARD (MATCHING TEMPLATE MOCKUP) */}
      <div className="w-full max-w-5xl bg-white dark:bg-[#1E293B] rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden grid grid-cols-1 lg:grid-cols-12 relative z-10 transition-all">
        
        {/* LEFT HALF: VIBRANT BLUE BRAND ARTWORK CARD (50% WIDTH ON DESKTOP) */}
        <div className="lg:col-span-6 bg-[#2B62D9] p-8 sm:p-12 text-white flex flex-col justify-between relative overflow-hidden min-h-[460px] lg:min-h-[620px]">
          
          {/* Decorative Background Blobs & Floating Confetti Shapes */}
          <div className="absolute -top-16 -left-16 w-64 h-64 bg-blue-400/30 rounded-full blur-xl pointer-events-none" />
          <div className="absolute -bottom-16 -right-16 w-80 h-80 bg-indigo-600/40 rounded-full blur-2xl pointer-events-none" />

          {/* Floating Confetti Elements */}
          <div className="absolute top-8 left-10 w-4 h-4 bg-amber-400 rounded-full opacity-80" />
          <div className="absolute top-14 right-12 w-3 h-6 bg-emerald-400 rounded-full rotate-45 opacity-80" />
          <div className="absolute bottom-24 left-8 w-5 h-2 bg-rose-400 rounded-full -rotate-12 opacity-80" />
          <div className="absolute top-1/2 right-6 w-3 h-3 bg-purple-300 rounded-full opacity-70" />

          {/* Top Brand Tag */}
          <div className="relative z-10 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 shadow-xs">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-lg tracking-tight font-display text-white">Talk2Me</span>
          </div>

          {/* Center Graphic Overlays (Simulating the mockup cards) */}
          <div className="relative z-10 my-auto py-6 flex flex-col items-center justify-center">
            
            {/* Main Yellow Floating Card (Course Preview) */}
            <div className="w-64 sm:w-72 bg-[#FFE380] text-slate-900 rounded-2xl p-4 shadow-xl -rotate-3 hover:rotate-0 transition-transform duration-300 relative border border-amber-200">
              <div className="flex items-center justify-between pb-2 border-b border-amber-300/60">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 bg-amber-200 px-2 py-0.5 rounded-full">YOUTUBE AI</span>
                <span className="text-[10px] font-bold text-amber-900">12 Từ vựng</span>
              </div>
              <div className="pt-3 space-y-1.5">
                <h4 className="font-extrabold text-xs text-slate-900 line-clamp-1">Fantasy English with Youtube</h4>
                <p className="text-[11px] text-slate-700">1. All-natural pronunciation</p>
                <p className="text-[11px] text-slate-700">2. Vocabulary in context</p>
              </div>
            </div>

            {/* Small Floating Audio Badge */}
            <div className="absolute -left-2 sm:left-4 bottom-10 bg-white text-slate-800 p-2.5 rounded-xl shadow-lg flex items-center gap-2.5 border border-slate-100 rotate-6">
              <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                <Volume2 className="w-4 h-4" />
              </div>
              <div className="text-[10px]">
                <p className="font-extrabold text-slate-900">Shadowing Voice</p>
                <p className="text-slate-500">Phát âm chuẩn AI</p>
              </div>
            </div>

            {/* Secondary Floating Feature Card */}
            <div className="absolute -right-2 sm:right-4 top-12 bg-white text-slate-800 p-3 rounded-2xl shadow-xl border border-slate-100 w-44 rotate-3">
              <div className="flex items-center gap-2 pb-1">
                <div className="w-6 h-6 rounded-md bg-amber-100 text-amber-600 flex items-center justify-center">
                  <Award className="w-3.5 h-3.5" />
                </div>
                <span className="text-[10px] font-extrabold text-slate-900">Spaced Repetition</span>
              </div>
              <p className="text-[9px] text-slate-500 leading-tight">Ghi nhớ từ vựng lâu dài với thuật toán SRS</p>
            </div>

          </div>

          {/* Bottom Heading & Subtitle & Pagination Dots */}
          <div className="relative z-10 text-center space-y-3 pt-2">
            <h3 className="text-xl sm:text-2xl font-black text-white leading-snug">
              Học Tiếng Anh Qua Video YouTube
            </h3>
            <p className="text-xs text-blue-100 max-w-xs mx-auto leading-relaxed">
              Tự động tạo khóa học Flashcard, chép chính tả và luyện nói cùng trợ lý AI thông minh.
            </p>

            {/* Pagination Dots */}
            <div className="flex items-center justify-center gap-1.5 pt-1">
              <span className="w-2 h-2 rounded-full bg-white opacity-40" />
              <span className="w-5 h-2 rounded-full bg-white" />
              <span className="w-2 h-2 rounded-full bg-white opacity-40" />
            </div>
          </div>

        </div>

        {/* RIGHT HALF: CLEAN WHITE FORM CANVAS (MATCHING EXACT TEMPLATE LOGIC) */}
        <div className="lg:col-span-6 p-8 sm:p-12 bg-white dark:bg-[#1E293B] flex flex-col justify-center relative">
          
          <div className="max-w-sm mx-auto w-full space-y-6">
            
            {/* Center Circular Logo (Matching the leaf/book logo from template) */}
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900 flex items-center justify-center text-[#2B62D9] dark:text-blue-400 shadow-sm">
                <BookOpen className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white font-display">
                  {mode === 'login' ? 'Hello Again!' : 'Chào Mừng Bạn!'}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
                  {mode === 'login' 
                    ? 'Đăng nhập tài khoản Talk2Me để tiếp tục lưu tiến độ học tập' 
                    : 'Tạo tài khoản miễn phí để đồng bộ từ vựng và bài học AI'}
                </p>
              </div>
            </div>

            {/* Redirect Reason Banner */}
            {redirectReason && (
              <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span>{redirectReason}</span>
              </div>
            )}

            {/* Error Message Banner */}
            {errorMessage && (
              <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-xs text-red-600 dark:text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* LOGIN FORM */}
            {mode === 'login' ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                
                {/* Email Input Field */}
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    className="w-full pl-4 pr-10 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#2B62D9] focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-4" />
                </div>

                {/* Password Input Field */}
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full pl-4 pr-10 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#2B62D9] focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                  </button>
                </div>

                {/* Controls Row: Remember Me & Recovery Password */}
                <div className="flex items-center justify-between text-xs pt-0.5">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-500 dark:text-slate-400">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-slate-300 text-[#2B62D9] focus:ring-[#2B62D9]"
                    />
                    <span>Remember Me</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => alert('Đã gửi liên kết khôi phục mật khẩu tới email của bạn.')}
                    className="text-slate-500 dark:text-slate-400 hover:text-[#2B62D9] dark:hover:text-blue-400 font-medium text-xs transition-colors"
                  >
                    Recovery Password
                  </button>
                </div>

                {/* Primary Solid Blue Login Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 rounded-2xl bg-[#2B62D9] hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:opacity-50"
                >
                  {isLoading ? (
                    <span>Đang đăng nhập...</span>
                  ) : (
                    <span>Login</span>
                  )}
                </button>

                {/* Google Sign In Button */}
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-2.5 transition-colors shadow-2xs"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Sign in with Google</span>
                </button>

              </form>
            ) : (
              /* SIGNUP FORM */
              <form onSubmit={handleSignupSubmit} className="space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Họ và Tên"
                    className="w-full pl-4 pr-10 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#2B62D9] focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute right-3.5 top-4" />
                </div>

                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    className="w-full pl-4 pr-10 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#2B62D9] focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-4" />
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mật khẩu (ít nhất 6 ký tự)"
                    className="w-full pl-4 pr-10 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#2B62D9] focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-4" />
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Xác nhận mật khẩu"
                    className="w-full pl-4 pr-10 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#2B62D9] focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-4" />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 rounded-2xl bg-[#2B62D9] hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:opacity-50"
                >
                  {isLoading ? (
                    <span>Đang tạo tài khoản...</span>
                  ) : (
                    <span>Tạo Tài Khoản</span>
                  )}
                </button>
              </form>
            )}

            {/* Bottom Account Switch Prompt */}
            <div className="pt-2 text-center text-xs text-slate-500 dark:text-slate-400">
              {mode === 'login' ? (
                <span>
                  Don't have an account yet?{' '}
                  <button
                    type="button"
                    onClick={() => { setMode('signup'); setErrorMessage(''); }}
                    className="font-extrabold text-[#2B62D9] hover:underline dark:text-blue-400"
                  >
                    Sign Up
                  </button>
                </span>
              ) : (
                <span>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => { setMode('login'); setErrorMessage(''); }}
                    className="font-extrabold text-[#2B62D9] hover:underline dark:text-blue-400"
                  >
                    Login
                  </button>
                </span>
              )}
            </div>

            {/* Quick Demo Login Option */}
            <div className="pt-1 text-center">
              <button
                type="button"
                onClick={handleDemoLogin}
                disabled={isLoading}
                className="text-[11px] font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                Trải nghiệm dùng thử bằng tài khoản Demo (1-Click)
              </button>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
