import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { reportService } from '../services/reportService';
import { UserNotification } from '../types';
import {
  MapPin,
  PlusCircle,
  Search,
  Bell,
  User as UserIcon,
  Shield,
  LogOut,
  Menu,
  X,
  Compass,
  Check,
  ExternalLink,
  MessageSquare,
  Info,
  Globe,
  FileText,
  CheckCircle2,
  CircleDot,
} from 'lucide-react';

const logoSrc = `${import.meta.env.BASE_URL}assets/aistudio/FixMyRAK_Coastal_Community_Logo_d0e1428a.png`;
const wordmarkSrc = `${import.meta.env.BASE_URL}assets/fixmyrak-wordmark.png`;

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  openAuthModal: () => void;
  openReportModal?: () => void;
  myReportsCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  openAuthModal,
  myReportsCount = 0,
}) => {
  const { user, userProfile, isAdmin, logout } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [notificationActionError, setNotificationActionError] = useState('');

  // Listen to in-app notifications
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }

    const unsub = reportService.subscribeNotifications(user.uid, (notifs) => {
      setNotifications(notifs);
    });

    return () => unsub();
  }, [user]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAsRead = async (notifId: string) => {
    await reportService.markNotificationAsRead(notifId);
  };

  const handleMarkAllAsRead = async () => {
    setNotificationActionError('');
    try {
      await reportService.markAllNotificationsAsRead(
        notifications.filter((notification) => !notification.read).map((notification) => notification.id)
      );
    } catch {
      setNotificationActionError('Could not mark notifications as read. Please try again.');
    }
  };

  const navLinks = [
    { id: 'home', label: t('nav.home') },
    { id: 'explore', label: t('nav.explore') },
    { id: 'map', label: t('nav.map') },
    {
      id: 'dashboard',
      label: t('nav.myReports'),
      badge: user ? myReportsCount : null,
      icon: FileText,
    },
    { id: 'about', label: t('nav.about') },
    { id: 'feedback', label: t('nav.feedback') },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#f6f7f3]/95 backdrop-blur-md border-b border-[#20362b]/8 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand matching website */}
          <div
            className="flex items-center gap-3 cursor-pointer group shrink-0"
            onClick={() => {
              setCurrentTab('home');
              setMobileMenuOpen(false);
            }}
          >
            <img
              src={logoSrc}
              alt="FixMyRAK Logo"
              className="h-12 w-12 object-contain rounded-xl group-hover:scale-105 transition-transform drop-shadow-xs bg-white p-0.5 border border-[#e4e9e1]"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="relative block h-[64px] w-[140px] shrink-0 overflow-hidden" role="img" aria-label="FixMyRAK">
                  <img
                    src={wordmarkSrc}
                    alt=""
                    aria-hidden="true"
                    className="absolute max-w-none"
                    style={{ width: '168px', left: '-9.5px', top: '-28.3px' }}
                  />
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[#e8f1e9] text-[#143d35] border border-[#143d35]/15 rounded-md">
                  {t('brand.badge')}
                </span>
              </div>
              <p className="text-[10px] font-medium text-[#74817b] leading-none mt-0.5 max-w-[200px] sm:max-w-none truncate">
                {t('brand.tagline')}
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => setCurrentTab(link.id)}
                className={`text-xs font-bold transition-all cursor-pointer relative py-1 flex items-center gap-1.5 ${
                  currentTab === link.id
                    ? 'text-[#143d35] underline underline-offset-8 decoration-2 decoration-[#e97950]'
                    : 'text-[#78827d] hover:text-[#143d35]'
                }`}
              >
                <span>{link.label}</span>
                {link.badge !== null && link.badge !== undefined && (
                  <span
                    className={`px-1.5 py-0.2 text-[10px] font-extrabold rounded-full ${
                      currentTab === link.id
                        ? 'bg-[#143d35] text-white'
                        : 'bg-[#e8f1e9] text-[#143d35]'
                    }`}
                  >
                    {link.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* Action Buttons, Language & Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Switcher Toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#e4e9e1] bg-white hover:bg-[#e8f1e9] text-xs font-bold text-[#143d35] transition-all cursor-pointer shadow-2xs group"
              title="Switch language / تغيير اللغة"
            >
              <Globe className="w-3.5 h-3.5 text-[#143d35] group-hover:rotate-12 transition-transform" />
              <span>{language === 'en' ? 'العربية' : 'English'}</span>
            </button>

            {/* Primary CTA: Report an Issue */}
            <button
              onClick={() => setCurrentTab('report')}
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[#143d35] hover:bg-[#205347] active:scale-95 shadow-md shadow-[#143d35]/15 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-[#d7edbd]" />
              <span>{t('nav.reportIssue')}</span>
            </button>

            {/* Notifications Bell (for signed in citizens) */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => {
                    setNotificationsOpen(!notificationsOpen);
                    setProfileDropdownOpen(false);
                  }}
                  className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors relative cursor-pointer"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 text-[10px] font-extrabold bg-red-500 text-white rounded-full flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Drawer */}
                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-[min(24rem,calc(100vw-2rem))] bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
                      <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <Bell className="w-4 h-4 text-emerald-600" />
                        In-App Notifications
                      </h4>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500">{unreadCount} unread</span>
                        {unreadCount > 0 && (
                          <button onClick={handleMarkAllAsRead} className="text-[10px] font-bold text-emerald-700 hover:underline whitespace-nowrap">
                            Mark all read
                          </button>
                        )}
                      </div>
                    </div>
                    {notificationActionError && <p role="alert" className="pt-2 text-[11px] text-red-600">{notificationActionError}</p>}

                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 my-2">
                      {notifications.length === 0 ? (
                        <div className="py-8 text-center text-xs text-slate-400">
                          No notifications yet. Status updates will appear here!
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div
                            key={notif.id}
                            className={`py-2.5 px-2 rounded-lg transition-colors ${
                              !notif.read ? 'bg-emerald-50/50' : 'hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-start gap-2">
                                {notif.title.includes('Resolved') ? <CheckCircle2 aria-hidden="true" className="mt-0.5 w-3.5 h-3.5 text-emerald-600 shrink-0" /> : <CircleDot aria-hidden="true" className="mt-0.5 w-3.5 h-3.5 text-[#e97950] shrink-0" />}
                                <p className="text-xs font-bold text-slate-800">{notif.title}</p>
                              </div>
                              {!notif.read && (
                                <button
                                  onClick={() => handleMarkAsRead(notif.id)}
                                  className="text-[10px] text-emerald-600 hover:underline shrink-0"
                                >
                                  Mark read
                                </button>
                              )}
                            </div>
                            <p className="text-xs text-slate-600 mt-0.5">
                              {notif.message}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-1">
                              {new Date(notif.createdAt).toLocaleDateString()} &bull;{' '}
                              {new Date(notif.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Admin Badge Quick Link */}
            {isAdmin && (
              <button
                onClick={() => setCurrentTab('admin')}
                className={`hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  currentTab === 'admin'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                {t('nav.admin')}
              </button>
            )}

            {/* User Auth / Profile Dropdown */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => {
                    setProfileDropdownOpen(!profileDropdownOpen);
                    setNotificationsOpen(false);
                  }}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors border border-slate-200 cursor-pointer"
                >
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'User'}
                      className="w-7 h-7 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">
                      {(user.displayName || user.email || 'U')[0].toUpperCase()}
                    </div>
                  )}
                  <span className="text-xs font-semibold text-slate-800 max-w-[100px] truncate hidden sm:inline-block">
                    {user.displayName || user.email?.split('@')[0]}
                  </span>
                </button>

                {/* Dropdown Menu */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {user.displayName || 'Citizen'}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">
                        {user.email}
                      </p>
                      {isAdmin && (
                        <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-700 rounded-full">
                          Administrator
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        setCurrentTab('dashboard');
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <FileText className="w-4 h-4 text-[#143d35]" />
                      {t('nav.myReports')} ({myReportsCount})
                    </button>

                    <button
                      onClick={() => {
                        setCurrentTab('report');
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <PlusCircle className="w-4 h-4 text-emerald-600" />
                      {t('nav.reportIssue')}
                    </button>

                    {isAdmin && (
                      <button
                        onClick={() => {
                          setCurrentTab('admin');
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-bold text-purple-700 hover:bg-purple-50 flex items-center gap-2"
                      >
                        <Shield className="w-4 h-4 text-purple-600" />
                        {t('nav.admin')}
                      </button>
                    )}

                    <div className="border-t border-slate-100 my-1"></div>

                    <button
                      onClick={async () => {
                        setProfileDropdownOpen(false);
                        await logout();
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4 text-red-500" />
                      {t('nav.signOut')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={openAuthModal}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-100 transition-colors border border-slate-200 cursor-pointer shadow-2xs"
              >
                <UserIcon className="w-4 h-4 text-[#143d35]" />
                <span>{t('nav.signIn')}</span>
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#e4e9e1] bg-[#f6f7f3] px-4 pt-3 pb-5 space-y-2 shadow-lg">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#e4e9e1]">
            <div className="flex items-center gap-2">
              <img
                src={logoSrc}
                alt="FixMyRAK"
                className="w-8 h-8 object-contain rounded-lg bg-white p-0.5 border border-[#e4e9e1]"
              />
              <span className="text-xs font-bold text-[#143d35]">FixMyRAK Navigation</span>
            </div>
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[#e4e9e1] bg-white text-xs font-bold text-[#143d35]"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{language === 'en' ? 'العربية' : 'English'}</span>
            </button>
          </div>

          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => {
                setCurrentTab(link.id);
                setMobileMenuOpen(false);
              }}
              className={`flex items-center justify-between w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
                currentTab === link.id
                  ? 'text-[#143d35] bg-[#e8f1e9] font-bold border border-[#d7edbd]'
                  : 'text-[#1c302c] hover:bg-stone-100'
              }`}
            >
              <span>{link.label}</span>
              {link.badge !== null && link.badge !== undefined && (
                <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-[#143d35] text-white">
                  {link.badge}
                </span>
              )}
            </button>
          ))}

          <button
            onClick={() => {
              setCurrentTab('report');
              setMobileMenuOpen(false);
            }}
            className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-3 rounded-full text-sm font-bold text-white bg-[#143d35] hover:bg-[#205347] cursor-pointer shadow-sm"
          >
            <PlusCircle className="w-4 h-4 text-[#d7edbd]" />
            {t('nav.reportIssue')}
          </button>

          {isAdmin && (
            <button
              onClick={() => {
                setCurrentTab('admin');
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-[#143d35] bg-[#e8f1e9] hover:bg-[#d7edbd]/70 border border-[#d7edbd] cursor-pointer"
            >
              <Shield className="w-4 h-4 text-[#143d35]" />
              {t('nav.admin')}
            </button>
          )}
        </div>
      )}
    </header>
  );
};
