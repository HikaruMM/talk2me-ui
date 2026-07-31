import React, { useState } from 'react';
import { UserProfile } from '../../core/entities';
import { 
  Sparkles, 
  BookOpen, 
  Layers, 
  BarChart3, 
  Users, 
  Home, 
  Moon, 
  Sun, 
  Bell, 
  Flame, 
  PlusCircle, 
  GraduationCap, 
  LogOut, 
  ChevronRight, 
  LogIn
} from 'lucide-react';

interface HeaderTopNavProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  onOpenCreateModal: (prefillUrl?: string) => void;
  streakCount: number;
  user?: UserProfile | null;
  onLogout?: () => void;
  onOpenAuth?: (initialMode?: 'login' | 'signup') => void;
}

export const HeaderTopNav: React.FC<HeaderTopNavProps> = ({
  currentTab,
  setCurrentTab,
  darkMode,
  setDarkMode,
  onOpenCreateModal,
  streakCount,
  user,
  onLogout,
  onOpenAuth,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'courses', label: 'Courses', icon: BookOpen },
    { id: 'flashcards', label: 'Flashcards', icon: Layers },
    { id: 'progress', label: 'Progress', icon: BarChart3 },
    { id: 'community', label: 'Community', icon: Users },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-[#1E293B]/90 backdrop-blur-md border-b border-[#E4E8F0] dark:border-[#334155] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Logo Brand */}
          <div 
            onClick={() => setCurrentTab('home')}
            className="flex items-center gap-3 cursor-pointer group shrink-0"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#2E68FF] to-[#7C5CFC] flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight text-[#1B1F2E] dark:text-[#F1F5F9] font-display">
                  Talk2Me
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#EAF1FF] dark:bg-[#1A2540] text-[#2E68FF] dark:text-[#5B8CFF] font-semibold border border-blue-200/50 dark:border-blue-800/40">
                  LearnTube
                </span>
              </div>
              <p className="text-[11px] text-[#5A6478] dark:text-[#CBD5E1] hidden sm:block">
                AI Video & Skill Platform
              </p>
            </div>
          </div>

          {/* Top Navigation Bar Tabs */}
          <nav className="hidden xl:flex items-center gap-1 bg-[#F1F4F9] dark:bg-[#273449] p-1.5 rounded-full border border-[#E4E8F0] dark:border-[#334155] shrink-0">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 transition-all duration-200 ${
                    isActive
                      ? 'bg-[#2E68FF] text-white shadow-sm'
                      : 'text-[#5A6478] dark:text-[#CBD5E1] hover:text-[#1B1F2E] dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-700/50'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="whitespace-nowrap">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Action Tools */}
          <div className="flex items-center gap-3">
            
            {/* Create Course Button */}
            <button
              onClick={() => onOpenCreateModal()}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#2E68FF] hover:bg-[#1E52DB] text-white text-xs font-bold shadow-sm transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Tạo khóa học</span>
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2.5 rounded-full text-[#5A6478] dark:text-[#CBD5E1] hover:bg-[#F1F4F9] dark:hover:bg-[#273449] border border-[#E4E8F0] dark:border-[#334155] transition-colors"
              title="Toggle theme"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowUserMenu(false);
                }}
                className="p-2.5 rounded-full text-[#5A6478] dark:text-[#CBD5E1] hover:bg-[#F1F4F9] dark:hover:bg-[#273449] border border-[#E4E8F0] dark:border-[#334155] transition-colors relative"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#2E68FF]" />
              </button>

              {/* Notification Popup */}
              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-[#1E293B] rounded-2xl shadow-xl border border-[#E4E8F0] dark:border-[#334155] p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#E4E8F0] dark:border-[#334155]">
                    <span className="font-bold text-sm">Thông báo</span>
                    <span className="text-[11px] text-[#2E68FF] font-semibold cursor-pointer">Đánh dấu đã đọc</span>
                  </div>
                  <div className="space-y-2">
                    <div className="p-2.5 rounded-xl bg-[#EAF1FF] dark:bg-[#1A2540] text-xs space-y-1">
                      <p className="font-semibold text-[#2E68FF]">🎉 Đã tạo khóa học thành công!</p>
                      <p className="text-[#5A6478] dark:text-[#CBD5E1]">Khóa học "Advance Figma Prototyping" đã sẵn sàng.</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs space-y-1">
                      <p className="font-semibold">🔥 Nhắc nhở Chuỗi (Streak)</p>
                      <p className="text-[#5A6478] dark:text-[#CBD5E1]">Bạn có 3 thẻ ghi nhớ cần ôn tập hôm nay.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Avatar with Popup Menu OR Sign In / Sign Up Buttons */}
            <div className="relative pl-2 border-l border-[#E4E8F0] dark:border-[#334155] flex items-center gap-2">
              {user ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setShowUserMenu(!showUserMenu);
                      setShowNotifications(false);
                    }}
                    className="flex items-center gap-2 p-0.5 rounded-full hover:ring-2 hover:ring-[#2E68FF]/50 transition-all focus:outline-none"
                  >
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user.name}
                        className="w-9 h-9 rounded-full object-cover border-2 border-white dark:border-slate-800 shadow-sm"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 text-white font-bold text-sm flex items-center justify-center border-2 border-white dark:border-slate-800 shadow-sm">
                        {user.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </button>

                  {/* User Menu Popup */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-[#1E293B] rounded-3xl shadow-2xl border border-[#E4E8F0] dark:border-[#334155] p-5 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-4">
                      {/* User Profile Header */}
                      <div className="flex items-center gap-3 pb-3 border-b border-[#E4E8F0] dark:border-[#334155]">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 text-white font-extrabold text-base flex items-center justify-center shadow-md overflow-hidden">
                          {user.avatarUrl ? (
                            <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                          ) : (
                            user.name.slice(0, 2).toUpperCase()
                          )}
                        </div>
                        <div className="overflow-hidden">
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-extrabold text-sm text-[#1B1F2E] dark:text-white truncate">{user.name}</h4>
                            <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-amber-500 text-white uppercase">
                              {user.role || 'Pro'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                        </div>
                      </div>

                      {/* STREAK INFORMATION CARD */}
                      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-sm">
                              <Flame className="w-5 h-5 fill-white animate-bounce" />
                            </div>
                            <div>
                              <p className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">Chuỗi học tập</p>
                              <h5 className="text-base font-black text-amber-700 dark:text-amber-300">
                                {user.streakDays || streakCount} Day Streak 🔥
                              </h5>
                            </div>
                          </div>
                          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-500 text-white shadow-xs">
                            Tích cực
                          </span>
                        </div>

                        <p className="text-xs text-amber-800 dark:text-amber-300 font-medium leading-relaxed">
                          Bạn đã hoàn thành mục tiêu học tập <strong>{user.streakDays || streakCount} ngày liên tiếp</strong>. Giữ vững phong độ nhé!
                        </p>
                      </div>

                      {/* Quick User Links */}
                      <div className="space-y-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
                        <button
                          type="button"
                          onClick={() => {
                            setCurrentTab('progress');
                            setShowUserMenu(false);
                          }}
                          className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          <div className="flex items-center gap-2.5">
                            <BarChart3 className="w-4 h-4 text-blue-500" />
                            <span>Báo cáo tiến độ cá nhân</span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setCurrentTab('settings');
                            setShowUserMenu(false);
                          }}
                          className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-800 dark:text-slate-200 transition-colors group"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-900/60 text-[#2E68FF] flex items-center justify-center">
                              <Sparkles className="w-3.5 h-3.5" />
                            </div>
                            <span className="font-bold">Cài đặt AI & Key</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-blue-500 text-white">BYOK</span>
                            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                          </div>
                        </button>

                        <div className="pt-2 border-t border-[#E4E8F0] dark:border-[#334155]">
                          <button
                            type="button"
                            onClick={() => {
                              setShowUserMenu(false);
                              if (onLogout) onLogout();
                            }}
                            className="w-full flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Đăng xuất</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenAuth) onOpenAuth('login');
                    else setCurrentTab('auth');
                  }}
                  className="px-4 py-2 rounded-full text-xs font-extrabold text-white bg-[#2E68FF] hover:bg-blue-600 shadow-sm transition-all flex items-center gap-2 active:scale-95"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Đăng nhập</span>
                </button>
              )}
            </div>

          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="flex lg:hidden items-center justify-around py-2 border-t border-[#E4E8F0] dark:border-[#334155]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl text-xs font-medium ${
                  isActive ? 'text-[#2E68FF] font-bold' : 'text-[#5A6478] dark:text-[#CBD5E1]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

      </div>
    </header>
  );
};
