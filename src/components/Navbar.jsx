import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Languages, Sun, Moon, User, Settings, LogOut, Sprout, MessageSquare, Bell, Wifi, WifiOff } from 'lucide-react';
import WhatsAppBotModal from './WhatsAppBotModal';
import SmsAlertModal from './SmsAlertModal';
import { isLowBandwidthMode, setLowBandwidthMode, getOfflineQueue } from '../lib/offlineQueue';

function Navbar({ currentView, onNavigate, onOpenSettings, currentUser, onLogout, darkMode, onToggleDarkMode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [whatsappModalOpen, setWhatsappModalOpen] = useState(false);
  const [smsModalOpen, setSmsModalOpen] = useState(false);
  const [lowBandwidth, setLowBandwidth] = useState(false);
  const [offlineCount, setOfflineCount] = useState(0);
  const { language, toggleLanguage, t } = useLanguage();
  const dropdownRef = useRef(null);

  useEffect(() => {
    setLowBandwidth(isLowBandwidthMode());
    setOfflineCount(getOfflineQueue().length);
  }, []);

  const navLinks = [
    { label: t('dashboard'), view: 'dashboard' },
    { label: t('weather'), view: 'weather' },
    { label: t('disease'), view: 'disease' },
    { label: t('guides'), view: 'guides' },
    { label: t('yield'), view: 'yield' },
  ];

  const handleLinkClick = (e, view) => {
    e.preventDefault();
    onNavigate(view);
    setMenuOpen(false);
  };

  const handleScanClick = (e) => {
    e.preventDefault();
    onNavigate('disease');
    setMenuOpen(false);
    setTimeout(() => {
      document.getElementById('upload')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const getLanguageLabel = () => {
    if (language === 'en') return 'EN';
    if (language === 'ur') return 'اردو';
    return 'پنجابی';
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-[#213024] bg-[#131D16] text-white transition-colors duration-200">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
        
        {/* Logo */}
        <a
          href="#dashboard"
          onClick={(e) => handleLinkClick(e, 'dashboard')}
          className="flex items-center gap-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 rounded-xl p-1"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-xs">
            <Sprout size={18} aria-hidden="true" />
          </span>
          <span className="text-lg font-bold tracking-tight text-white font-sans">
            Cropex
          </span>
        </a>

        {/* Desktop Links */}
        <ul className="hidden md:flex items-center gap-1 lg:gap-1.5">
          {navLinks.map((link) => {
            const isActive = currentView === link.view;
            return (
              <li key={link.view}>
                <a
                  href={`#${link.view}`}
                  onClick={(e) => handleLinkClick(e, link.view)}
                  className={`text-xs lg:text-sm font-medium transition-all py-1.5 px-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                    isActive
                      ? 'text-white bg-white/15 font-semibold'
                      : 'text-stone-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {link.label}
                </a>
              </li>
            );
          })}
        </ul>

        {/* Right Action Controls */}
        <div className="hidden md:flex items-center gap-2 lg:gap-2.5">
          {/* WhatsApp Bot Simulation Launcher */}
          <button
            type="button"
            onClick={() => setWhatsappModalOpen(true)}
            className="h-8 inline-flex items-center gap-1.5 rounded-full bg-[#1b281f] hover:bg-[#25372b] text-stone-200 border border-[#2d3e31] px-3.5 text-xs font-medium transition shadow-xs cursor-pointer"
            title="Open WhatsApp Farm Assistant (واٹس ایپ بوٹ)"
          >
            <MessageSquare size={13} className="text-emerald-400" />
            <span>WhatsApp Bot</span>
          </button>

          {/* District SMS Outbreak Alerts */}
          <button
            type="button"
            onClick={() => setSmsModalOpen(true)}
            className="h-8 inline-flex items-center gap-1.5 rounded-full bg-[#1b281f] hover:bg-[#25372b] text-stone-200 border border-[#2d3e31] px-3 text-xs font-medium transition shadow-xs cursor-pointer"
            title="District Outbreak Emergency SMS Alerts"
          >
            <Bell size={13} className="text-amber-400" />
            <span>SMS Alerts</span>
          </button>

          {/* Low-Bandwidth 2G Mode Toggle */}
          <button
            type="button"
            onClick={() => {
              const next = !lowBandwidth;
              setLowBandwidthMode(next);
              setLowBandwidth(next);
            }}
            className={`h-8 inline-flex items-center gap-1.5 rounded-full px-3 text-xs font-bold transition shadow-xs cursor-pointer ${
              lowBandwidth
                ? 'bg-[#a3e635] text-[#142900] hover:bg-[#bef264]'
                : 'bg-[#a3e635] text-[#142900] hover:bg-[#bef264]'
            }`}
            title="Toggle Rural 2G / Low-Bandwidth Mode"
          >
            {lowBandwidth ? <WifiOff size={13} /> : <Wifi size={13} />}
            <span>2G mode</span>
            {offlineCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-900 text-white text-[9px] font-bold">
                {offlineCount}
              </span>
            )}
          </button>

          {/* Language Toggle Button */}
          <button
            onClick={() => toggleLanguage()}
            className="h-8 inline-flex items-center justify-center rounded-full bg-[#1b281f] border border-[#2d3e31] px-3 text-xs font-medium text-stone-200 hover:text-white hover:bg-[#25372b] transition-colors cursor-pointer"
            title="Toggle Language (English / Urdu / Punjabi)"
          >
            <span>{language === 'en' ? 'EN | اردو' : getLanguageLabel()}</span>
          </button>

          {/* Dark Mode Toggle Button */}
          <button
            onClick={onToggleDarkMode}
            className="h-8 w-8 inline-flex items-center justify-center rounded-full text-stone-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {darkMode ? <Sun size={16} aria-hidden="true" /> : <Moon size={16} aria-hidden="true" />}
          </button>

          {/* Profile Menu Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="h-8 w-8 inline-flex items-center justify-center rounded-full text-stone-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <User size={16} aria-hidden="true" />
            </button>

            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-[#18231b] border border-[#2b3c2e] text-stone-200 rounded-xl shadow-card py-1 z-50">
                {currentUser && (
                  <div className="px-4 py-2 border-b border-[#2b3c2e]">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-xs font-bold text-white truncate">{currentUser.fullName}</p>
                      {currentUser.isGuest && (
                        <span className="text-[9px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-1.5 py-0.5 rounded-full font-bold">
                          Guest
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-stone-400 truncate">{currentUser.email}</p>
                  </div>
                )}

                <button
                  onClick={() => { onOpenSettings(); setProfileDropdownOpen(false); }}
                  className="w-full text-left px-4 py-2 text-xs font-medium text-stone-300 hover:bg-white/10 hover:text-white transition-colors"
                >
                  <Settings size={14} className="inline mr-2" aria-hidden="true" /> {t('settings')}
                </button>

                {currentUser && (
                  <button
                    onClick={() => { onLogout(); setProfileDropdownOpen(false); }}
                    className="w-full text-left px-4 py-2 text-xs font-bold text-rose-400 hover:bg-white/10 transition-colors"
                  >
                    <LogOut size={14} className="inline mr-2" aria-hidden="true" /> {currentUser.isGuest ? 'Exit Guest Mode' : t('signOut')}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Controls */}
        <div className="flex items-center gap-1.5 md:hidden">
          <button
            onClick={onToggleDarkMode}
            className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-stone-300 hover:text-white transition-colors cursor-pointer"
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {darkMode ? <Sun size={16} aria-hidden="true" /> : <Moon size={16} aria-hidden="true" />}
          </button>
          <button
            onClick={() => toggleLanguage()}
            className="h-8 px-2.5 inline-flex items-center justify-center rounded-full bg-[#1b281f] border border-[#2d3e31] text-xs font-medium text-stone-200"
          >
            <span>EN | اردو</span>
          </button>
          
          <button
            type="button"
            className="h-8 w-8 inline-flex items-center justify-center rounded-lg p-1 text-stone-300 hover:text-white transition-colors"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {menuOpen && (
        <div className="border-t border-neutral-border bg-neutral-surface px-4 py-4 md:hidden text-left space-y-3">
          <ul className="flex flex-col gap-1">
            {navLinks.map((link) => {
              const isActive = currentView === link.view;
              return (
                <li key={link.view}>
                  <a
                    href={`#${link.view}`}
                    onClick={(e) => handleLinkClick(e, link.view)}
                    className={`block rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold transition-colors ${
                      isActive
                        ? 'text-brand-primary bg-brand-surface'
                        : 'text-neutral-medium hover:bg-neutral-fill hover:text-neutral-high'
                    }`}
                  >
                    {link.label}
                  </a>
                </li>
              );
            })}
          </ul>

          <div className="pt-3 border-t border-neutral-border flex flex-col gap-2">
            {currentUser && (
              <div className="px-3.5 py-1">
                <p className="text-xs font-bold text-neutral-high truncate">{currentUser.fullName}</p>
              </div>
            )}
            <button
              onClick={() => { setWhatsappModalOpen(true); setMenuOpen(false); }}
              className="text-left rounded-xl px-3.5 py-2.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:bg-neutral-fill"
            >
              <MessageSquare size={14} className="inline mr-2 text-emerald-600" aria-hidden="true" /> WhatsApp Farm Bot (واٹس ایپ)
            </button>
            <button
              onClick={() => { setSmsModalOpen(true); setMenuOpen(false); }}
              className="text-left rounded-xl px-3.5 py-2.5 text-xs font-bold text-amber-700 dark:text-amber-300 hover:bg-neutral-fill"
            >
              <Bell size={14} className="inline mr-2 text-amber-600" aria-hidden="true" /> District Outbreak Alerts (ایمرجنسی الرٹ)
            </button>
            <button
              onClick={() => { toggleLanguage(); setMenuOpen(false); }}
              className="text-left rounded-xl px-3.5 py-2.5 text-xs font-semibold text-neutral-medium hover:bg-neutral-fill"
            >
              <Languages size={14} className="inline mr-2" aria-hidden="true" /> {getLanguageLabel()}
            </button>
            <button
              onClick={() => { onOpenSettings(); setMenuOpen(false); }}
              className="text-left rounded-xl px-3.5 py-2.5 text-xs font-semibold text-neutral-medium hover:bg-neutral-fill"
            >
              <Settings size={14} className="inline mr-2" aria-hidden="true" /> {t('settings')}
            </button>
            {currentUser && (
              <button
                onClick={() => {
                  onLogout();
                  setMenuOpen(false);
                }}
                className="text-left rounded-xl px-3.5 py-2.5 text-xs font-bold text-semantic-high hover:bg-neutral-fill"
              >
                <LogOut size={14} className="inline mr-2" aria-hidden="true" /> {currentUser.isGuest ? 'Exit Guest Mode' : t('signOut')}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Phase 6: WhatsApp Bot & SMS Emergency Modals */}
      <WhatsAppBotModal
        isOpen={whatsappModalOpen}
        onClose={() => setWhatsappModalOpen(false)}
      />

      <SmsAlertModal
        isOpen={smsModalOpen}
        onClose={() => setSmsModalOpen(false)}
      />
    </header>
  );
}

export default Navbar;
