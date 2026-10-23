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
    <header className="sticky top-0 z-40 border-b border-neutral-border bg-neutral-surface/90 backdrop-blur-md transition-colors duration-200">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
        
        {/* Logo */}
        <a
          href="#dashboard"
          onClick={(e) => handleLinkClick(e, 'dashboard')}
          className="flex items-center gap-2.5 focus:outline-none focus:ring-2 focus:ring-brand-primary rounded-xl p-1"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-primary text-base text-neutral-surface shadow-sm">
            <Sprout size={20} aria-hidden="true" />
          </span>
          <span className="text-lg font-bold tracking-tight text-neutral-high font-sans">
            Crop<span className="font-semibold text-brand-primary">ex</span>
          </span>
        </a>

        {/* Desktop Links */}
        <ul className="hidden md:flex items-center gap-1.5 lg:gap-2">
          {navLinks.map((link) => {
            const isActive = currentView === link.view;
            return (
              <li key={link.view}>
                <a
                  href={`#${link.view}`}
                  onClick={(e) => handleLinkClick(e, link.view)}
                  className={`text-xs lg:text-sm font-semibold transition-all py-2 px-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary ${
                    isActive
                      ? 'text-brand-primary bg-brand-surface font-bold shadow-xs'
                      : 'text-neutral-medium hover:text-neutral-high hover:bg-neutral-fill'
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
            className="h-9 inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 lg:px-3 text-xs font-bold transition shadow-xs cursor-pointer"
            title="Open WhatsApp Farm Assistant (واٹس ایپ بوٹ)"
          >
            <MessageSquare size={14} />
            <span>WhatsApp Bot</span>
          </button>

          {/* District SMS Outbreak Alerts */}
          <button
            type="button"
            onClick={() => setSmsModalOpen(true)}
            className="h-9 inline-flex items-center gap-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-700/60 px-2 lg:px-2.5 text-xs font-bold transition shadow-xs cursor-pointer"
            title="District Outbreak Emergency SMS Alerts"
          >
            <Bell size={14} className="text-amber-600 dark:text-amber-400" />
            <span className="hidden lg:inline">Alerts</span>
          </button>

          {/* Low-Bandwidth 2G Mode Toggle */}
          <button
            type="button"
            onClick={() => {
              const next = !lowBandwidth;
              setLowBandwidthMode(next);
              setLowBandwidth(next);
            }}
            className={`h-9 inline-flex items-center gap-1.5 rounded-xl px-2 lg:px-2.5 text-xs font-bold border transition shadow-xs cursor-pointer ${
              lowBandwidth
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-neutral-fill border-neutral-border text-neutral-medium hover:text-neutral-high'
            }`}
            title="Toggle Rural 2G / Low-Bandwidth Mode"
          >
            {lowBandwidth ? <WifiOff size={14} /> : <Wifi size={14} />}
            <span className="hidden xl:inline">{lowBandwidth ? '2G' : 'Speed'}</span>
            {offlineCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-white text-[9px] font-bold">
                {offlineCount}
              </span>
            )}
          </button>

          {/* Scan Leaf Button (Primary CTA) */}
          <a
            href="#upload"
            onClick={handleScanClick}
            className="h-9 inline-flex items-center justify-center rounded-xl bg-brand-primary px-3 lg:px-4 text-xs lg:text-sm font-semibold text-neutral-surface shadow-sm transition-all hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-brand-primary cursor-pointer"
          >
            {t('scanLeaf')}
          </a>

          {/* Language Toggle Button */}
          <button
            onClick={() => toggleLanguage()}
            className="h-9 inline-flex items-center justify-center rounded-xl bg-neutral-fill border border-neutral-border px-2.5 text-xs font-bold text-neutral-high shadow-sm hover:bg-neutral-border focus:outline-none focus:ring-2 focus:ring-brand-primary transition-colors cursor-pointer"
            title="Toggle Language (English / Urdu / Punjabi)"
          >
            <Languages size={15} className="mr-1" aria-hidden="true" />
            {getLanguageLabel()}
          </button>

          {/* Dark Mode Toggle Button */}
          <button
            onClick={onToggleDarkMode}
            className="h-9 w-9 inline-flex items-center justify-center rounded-xl bg-neutral-fill border border-neutral-border text-neutral-high shadow-sm hover:bg-neutral-border focus:outline-none focus:ring-2 focus:ring-brand-primary transition-colors cursor-pointer"
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {darkMode ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
          </button>

          {/* Profile Menu Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="h-9 w-9 inline-flex items-center justify-center rounded-full bg-neutral-fill border border-neutral-border text-neutral-high shadow-sm hover:bg-neutral-border focus:outline-none focus:ring-2 focus:ring-brand-primary transition-colors cursor-pointer"
            >
              <User size={18} aria-hidden="true" />
            </button>

            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-neutral-surface border border-neutral-border rounded-xl shadow-card py-1 z-50">
                {currentUser && (
                  <div className="px-4 py-2 border-b border-neutral-border">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-xs font-bold text-neutral-high truncate">{currentUser.fullName}</p>
                      {currentUser.isGuest && (
                        <span className="text-[9px] bg-brand-surface text-brand-primary px-1.5 py-0.5 rounded-full font-bold">
                          Guest
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-neutral-medium truncate">{currentUser.email}</p>
                  </div>
                )}
                

                <button
                  onClick={() => { onOpenSettings(); setProfileDropdownOpen(false); }}
                  className="w-full text-left px-4 py-2 text-xs font-semibold text-neutral-medium hover:bg-neutral-fill hover:text-neutral-high transition-colors"
                >
                  <Settings size={14} className="inline mr-2" aria-hidden="true" /> {t('settings')}
                </button>

                {currentUser && (
                  <button
                    onClick={() => { onLogout(); setProfileDropdownOpen(false); }}
                    className="w-full text-left px-4 py-2 text-xs font-bold text-semantic-high hover:bg-neutral-fill transition-colors"
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
            className="h-9 w-9 inline-flex items-center justify-center rounded-xl bg-neutral-fill border border-neutral-border text-neutral-high shadow-sm hover:bg-neutral-border focus:outline-none focus:ring-2 focus:ring-brand-primary transition-colors cursor-pointer"
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {darkMode ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
          </button>
          <button
            onClick={() => toggleLanguage()}
            className="h-9 inline-flex items-center justify-center rounded-xl bg-neutral-fill border border-neutral-border px-2.5 text-xs font-bold text-neutral-high shadow-sm hover:bg-neutral-border focus:outline-none focus:ring-2 focus:ring-brand-primary transition-colors cursor-pointer"
          >
            <Languages size={16} aria-hidden="true" />
          </button>
          <a
            href="#upload"
            onClick={handleScanClick}
            className="h-9 inline-flex items-center justify-center rounded-xl bg-brand-primary px-3 text-xs font-semibold text-neutral-surface shadow-sm"
          >
            {t('scanLeaf')}
          </a>
          
          <button
            type="button"
            className="h-9 w-9 inline-flex items-center justify-center rounded-xl p-1 text-neutral-high hover:bg-neutral-fill transition-colors"
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
