import { useState } from 'react';

function SettingsModal({ isOpen, onClose, darkMode, onToggleDarkMode, onClearHistory, historyCount }) {
  const [showConfirm, setShowConfirm] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Application Settings">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-earth-100 bg-white p-6 shadow-elevated transition-all dark:border-earth-800 dark:bg-earth-850">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-earth-100 dark:border-earth-800">
          <h3 className="text-lg font-bold text-earth-900 dark:text-earth-50 flex items-center gap-2">
            <span>⚙️</span> System Settings
          </h3>
          <button
            type="button"
            className="rounded-lg p-1.5 text-earth-450 hover:bg-earth-50 dark:hover:bg-earth-800 transition-colors focus:outline-none focus:ring-2 focus:ring-crop-500"
            onClick={onClose}
            aria-label="Close settings"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="mt-6 space-y-6">
          
          {/* Theme Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-earth-800 dark:text-earth-200">Dark Interface</p>
              <p className="text-xs text-earth-450 dark:text-earth-400">Toggle dark mode stylesheet theme</p>
            </div>
            <button
              type="button"
              onClick={onToggleDarkMode}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-crop-500 focus:ring-offset-2 ${
                darkMode ? 'bg-crop-600' : 'bg-earth-200 dark:bg-earth-700'
              }`}
              role="switch"
              aria-checked={darkMode}
            >
              <span className="sr-only">Toggle Dark Mode</span>
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  darkMode ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* History Management */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-earth-800 dark:text-earth-200">Analysis History</p>
              <p className="text-xs text-earth-450 dark:text-earth-400">
                {historyCount > 0 ? `${historyCount} record(s) cached locally` : 'No cached history'}
              </p>
            </div>
            {showConfirm ? (
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-red-500 select-none">Confirm?</span>
                <button
                  type="button"
                  onClick={() => {
                    onClearHistory();
                    setShowConfirm(false);
                  }}
                  className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-red-750 transition-all cursor-pointer"
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => setShowConfirm(false)}
                  className="rounded-lg bg-earth-100 dark:bg-earth-800 px-3 py-1.5 text-xs font-medium text-earth-700 dark:text-earth-300 hover:bg-earth-200 dark:hover:bg-earth-700 transition-all cursor-pointer"
                >
                  No
                </button>
              </div>
            ) : (
              <button
                type="button"
                disabled={historyCount === 0}
                onClick={() => setShowConfirm(true)}
                className={`rounded-xl px-3.5 py-2 text-xs font-bold text-white shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-red-500 ${
                  historyCount > 0
                    ? 'bg-red-500 hover:bg-red-600 cursor-pointer'
                    : 'bg-earth-300 dark:bg-earth-800 text-earth-400 dark:text-earth-500 cursor-not-allowed shadow-none'
                }`}
              >
                Clear Cached
              </button>
            )}
          </div>

          {/* Version Info */}
          <div className="pt-4 border-t border-earth-100 dark:border-earth-800 flex items-center justify-between text-xs text-earth-450 dark:text-earth-400">
            <span>Product Version</span>
            <span className="font-mono font-bold bg-earth-50 dark:bg-earth-900 px-2 py-0.5 rounded text-earth-600 dark:text-earth-350">
              v1.0.0-stable
            </span>
          </div>

        </div>

      </div>
    </div>
  );
}

export default SettingsModal;
