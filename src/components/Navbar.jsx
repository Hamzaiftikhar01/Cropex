import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

function Navbar({ currentView, onNavigate, onOpenSettings, currentUser, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { language, toggleLanguage, t } = useLanguage();

  const navLinks = [
    { label: t('dashboard'), view: 'dashboard' },
    { label: t('weather'), view: 'weather' },
    { label: t('disease'), view: 'disease' },
    { label: t('irrigation'), view: 'irrigation' },
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
    if (language === 'en') return '🇺🇸 EN';
    if (language === 'ur') return '🇵🇰 اردو';
    return '🇵🇰 پنجابی';
  };

  return (
    <header className="sticky top-0 z-40 border-b border-earth-100 bg-white/85 backdrop-blur-lg transition-colors duration-200 dark:border-earth-800 dark:bg-earth-950/85">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        
        {/* Logo */}
        <a
          href="#dashboard"
          onClick={(e) => handleLinkClick(e, 'dashboard')}
          className="flex items-center gap-2.5 focus:outline-none focus:ring-2 focus:ring-crop-500 rounded-lg p-1"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-crop-600 text-base text-white shadow-sm shadow-crop-600/20">
            🌱
          </span>
          <span className="text-lg font-bold tracking-tight text-earth-900 dark:text-earth-50">
            Crop<span className="font-semibold text-crop-600 dark:text-crop-400">ex</span>
          </span>
        </a>

        {/* Desktop Links */}
        <ul className="hidden items-center gap-3 lg:gap-4 md:flex">
          {navLinks.map((link) => {
            const isActive = currentView === link.view;
            return (
              <li key={link.view}>
                <a
                  href={`#${link.view}`}
                  onClick={(e) => handleLinkClick(e, link.view)}
                  className={`text-xs lg:text-sm font-bold transition-colors duration-150 py-1.5 px-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-crop-500 ${
                    isActive
                      ? 'text-crop-600 bg-crop-50/50 dark:text-crop-400 dark:bg-crop-950/20'
                      : 'text-earth-500 hover:text-earth-900 dark:text-earth-400 dark:hover:text-earth-100'
                  }`}
                >
                  {link.label}
                </a>
              </li>
            );
          })}
        </ul>

        {/* Buttons (Scan, Language & Settings Toggle) */}
        <div className="hidden items-center gap-2.5 md:flex">
          <a
            href="#upload"
            onClick={handleScanClick}
            className="rounded-xl bg-crop-600 px-4 py-2.5 text-xs lg:text-sm font-semibold text-white shadow-sm shadow-crop-600/20 transition-all hover:bg-crop-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-crop-500"
          >
            {t('scanLeaf')}
          </a>

          {/* User Display */}
          {currentUser && (
            <span className="text-xs font-bold text-earth-650 dark:text-earth-300 bg-earth-50 dark:bg-earth-900 border border-earth-100 dark:border-earth-800 px-2.5 py-2.5 rounded-xl shadow-xs">
              👤 {currentUser.fullName}
            </span>
          )}

          {/* Urdu / English / Punjabi Switcher */}
          <button
            type="button"
            onClick={toggleLanguage}
            className="rounded-xl border border-earth-200 bg-white px-3 py-2 text-xs font-bold text-earth-700 shadow-soft hover:bg-earth-55 hover:text-earth-950 dark:border-earth-850 dark:bg-earth-850 dark:text-earth-300 dark:hover:bg-earth-800 cursor-pointer transition-colors"
          >
            {getLanguageLabel()}
          </button>
          
          <button
            type="button"
            onClick={onOpenSettings}
            className="rounded-xl border border-earth-200 bg-white p-2.5 text-earth-650 shadow-soft hover:bg-earth-55 hover:text-earth-950 dark:border-earth-850 dark:bg-earth-850 dark:text-earth-300 dark:hover:bg-earth-800 dark:hover:text-earth-100 focus:outline-none focus:ring-2 focus:ring-crop-500 cursor-pointer"
            aria-label="System Settings"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>

          {/* Logout Button */}
          {currentUser && (
            <button
              type="button"
              onClick={onLogout}
              className="rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-xs font-bold text-red-700 px-3.5 py-2.5 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-300 dark:hover:bg-red-900/35 cursor-pointer transition-colors"
            >
              {t('signOut')}
            </button>
          )}
        </div>

        {/* Mobile menu and settings toggles */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            type="button"
            onClick={toggleLanguage}
            className="rounded-xl border border-earth-200 bg-white px-2.5 py-1.5 text-xs font-bold text-earth-700 shadow-soft dark:border-earth-850 dark:bg-earth-850 dark:text-earth-300 focus:outline-none focus:ring-2 focus:ring-crop-500 cursor-pointer"
          >
            {getLanguageLabel()}
          </button>

          <button
            type="button"
            onClick={onOpenSettings}
            className="rounded-xl border border-earth-200 bg-white p-2 text-earth-650 shadow-soft dark:border-earth-850 dark:bg-earth-850 dark:text-earth-300 dark:hover:bg-earth-800 focus:outline-none focus:ring-2 focus:ring-crop-500 cursor-pointer"
            aria-label="System Settings"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>

          <button
            type="button"
            className="inline-flex items-center justify-center rounded-lg p-2 text-earth-660 hover:bg-earth-50 dark:text-earth-300 dark:hover:bg-earth-800 transition-colors focus:outline-none focus:ring-2 focus:ring-crop-500"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
        <div className="border-t border-earth-100 bg-white px-4 py-4 md:hidden dark:border-earth-800 dark:bg-earth-950 transition-colors duration-200 text-left">
          <ul className="flex flex-col gap-1">
            {navLinks.map((link) => {
              const isActive = currentView === link.view;
              return (
                <li key={link.view}>
                  <a
                    href={`#${link.view}`}
                    onClick={(e) => handleLinkClick(e, link.view)}
                    className={`block rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                      isActive
                        ? 'text-crop-600 bg-crop-50 dark:text-crop-400 dark:bg-crop-950/20'
                        : 'text-earth-600 hover:bg-earth-50 dark:text-earth-300 dark:hover:bg-earth-900'
                    }`}
                  >
                    {link.label}
                  </a>
                </li>
              );
            })}
          </ul>
          <a
            href="#upload"
            onClick={handleScanClick}
            className="mt-3 block rounded-xl bg-crop-600 px-5 py-2.5 text-center text-sm font-semibold text-white shadow-sm"
          >
            {t('scanLeaf')}
          </a>

          {/* Mobile User details and sign out */}
          {currentUser && (
            <div className="mt-4 pt-4 border-t border-earth-100 dark:border-earth-800">
              <div className="text-xs font-bold text-earth-800 dark:text-earth-200 px-3">
                👤 {currentUser.fullName}
              </div>
              <button
                onClick={(e) => {
                  onLogout();
                  setMenuOpen(false);
                }}
                className="w-full mt-3 block rounded-xl bg-red-50 text-red-700 hover:bg-red-100 py-2.5 text-center text-sm font-semibold dark:bg-red-950/20 dark:text-red-300 dark:hover:bg-red-900/35 transition-colors cursor-pointer"
              >
                {t('signOut')}
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

export default Navbar;
