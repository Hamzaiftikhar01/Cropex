import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Bell, Smartphone, CheckCircle2 } from 'lucide-react';
import {
  isValidPakistaniPhone,
  subscribeToSmsAlerts,
  getStoredSubscriptions,
  formatOutbreakSmsMessage,
  requestPushNotificationPermission,
  sendBrowserPushNotification,
} from '../lib/smsAlertService';
import { SUPPORTED_DISTRICTS } from '../lib/districtData';

export default function SmsAlertModal({ isOpen, onClose, defaultDistrict = 'Faisalabad', defaultCrop = 'Wheat' }) {
  const [phone, setPhone] = useState('');
  const [district, setDistrict] = useState(defaultDistrict);
  const [crop, setCrop] = useState(defaultCrop);
  const [language, setLanguage] = useState('ur');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [error, setError] = useState('');
  const [pushEnabled, setPushEnabled] = useState(false);
  const [testSent, setTestSent] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPushEnabled(Notification.permission === 'granted');
    }
    const existing = getStoredSubscriptions();
    if (existing.length > 0) {
      setPhone(existing[0].phone);
      setDistrict(existing[0].district || defaultDistrict);
    }
  }, [defaultDistrict]);

  useEffect(() => {
    if (isOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      const handleKeyDown = (e) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);

      return () => {
        document.body.style.overflow = prevOverflow;
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubscribe = (e) => {
    e.preventDefault();
    setError('');

    if (!isValidPakistaniPhone(phone)) {
      setError('براہ کرم درست پاکستانی موبائل نمبر درج کریں (مثلاً 03001234567)');
      return;
    }

    subscribeToSmsAlerts({ phone, district, crop, language });
    setIsSubscribed(true);
  };

  const handleEnablePush = async () => {
    const granted = await requestPushNotificationPermission();
    setPushEnabled(granted);
    if (granted) {
      sendBrowserPushNotification({
        title: '🌾 کراپیکس الرٹ الرٹ سروس فعال',
        body: `ضلع ${district} میں ${crop} کے کسانوں کے لیے ارلی وارننگ سسٹم فعال ہو گیا ہے۔`,
      });
    }
  };

  const handleSendTestSms = () => {
    setTestSent(true);
    sendBrowserPushNotification({
      title: `⚠️ ہنگامی وارننگ: ضلع ${district}`,
      body: formatOutbreakSmsMessage({ district, crop, disease: 'زرد کنگی / بلائیٹ', language }),
    });
    setTimeout(() => setTestSent(false), 4000);
  };

  const previewSms = formatOutbreakSmsMessage({
    district,
    crop,
    disease: crop === 'Wheat' ? 'زرد کنگی (Yellow Rust)' : 'جھلساؤ (Blight)',
    riskLevel: 'High',
    helpline: '0800-15000',
    language,
  });

  const modalContent = (
    <div 
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in text-left"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-earth-900 border border-earth-200 dark:border-earth-800 shadow-2xl p-6 sm:p-7 overflow-hidden"
      >
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-earth-150 dark:border-earth-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500 text-white shrink-0">
              <Bell size={20} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-earth-900 dark:text-earth-50">
                ضلعی ایمرجنسی SMS الرٹ (District Outbreak Alerts)
              </h3>
              <p className="text-xs text-earth-500 dark:text-earth-400">
                Direct early warnings for mobile phones & 2G feature phones
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-earth-400 hover:text-earth-700 dark:hover:text-earth-200 cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="mt-5 space-y-5">
          {/* Push Notification Banner */}
          <div className="p-3.5 rounded-xl bg-crop-50/60 dark:bg-crop-950/40 border border-crop-200/60 dark:border-crop-850 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Smartphone size={18} className="text-crop-600 dark:text-crop-400 shrink-0" />
              <div className="text-xs">
                <p className="font-bold text-earth-850 dark:text-earth-100">
                  {pushEnabled ? 'براؤزر پش نوٹیفکیشن آن ہیں' : 'براؤزر فوری الرٹ آن کریں'}
                </p>
                <p className="text-earth-500 dark:text-earth-400 text-[11px]">
                  Get instant popup notifications on severe epidemic alerts.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleEnablePush}
              disabled={pushEnabled}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition shrink-0 cursor-pointer ${
                pushEnabled
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                  : 'bg-crop-600 text-white hover:bg-crop-700'
              }`}
            >
              {pushEnabled ? '✓ Enabled' : 'Enable'}
            </button>
          </div>

          {/* Form */}
          {!isSubscribed ? (
            <form onSubmit={handleSubscribe} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-earth-700 dark:text-earth-300 mb-1">
                  موبائل نمبر (Pakistani Mobile Number) *
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="03001234567"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-earth-300 dark:border-earth-700 bg-white dark:bg-earth-800 text-sm focus:outline-none focus:ring-2 focus:ring-crop-500"
                  required
                />
                {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-earth-700 dark:text-earth-300 mb-1">
                    ضلع (District)
                  </label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-earth-300 dark:border-earth-700 bg-white dark:bg-earth-800 text-xs sm:text-sm"
                  >
                    {SUPPORTED_DISTRICTS.map((d) => (
                      <option key={d.name} value={d.name}>
                        {d.name} ({d.nameUr})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-earth-700 dark:text-earth-300 mb-1">
                    فصل (Crop)
                  </label>
                  <select
                    value={crop}
                    onChange={(e) => setCrop(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-earth-300 dark:border-earth-700 bg-white dark:bg-earth-800 text-xs sm:text-sm"
                  >
                    <option value="Wheat">Wheat (گندم)</option>
                    <option value="Rice">Rice (دھان)</option>
                    <option value="Cotton">Cotton (کپاس)</option>
                    <option value="Sugarcane">Sugarcane (کماد)</option>
                    <option value="Maize">Maize (مکئی)</option>
                    <option value="Potato">Potato (آلو)</option>
                    <option value="Tomato">Tomato (ٹماٹر)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs font-medium">
                <span className="text-earth-600 dark:text-earth-300">Language:</span>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="lang"
                    checked={language === 'ur'}
                    onChange={() => setLanguage('ur')}
                  />
                  <span>اردو (Urdu)</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="lang"
                    checked={language === 'en'}
                    onChange={() => setLanguage('en')}
                  />
                  <span>English</span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-crop-600 hover:bg-crop-700 text-white font-bold text-sm shadow-md transition cursor-pointer"
              >
                رجسٹر کریں (Subscribe to Outbreak SMS)
              </button>
            </form>
          ) : (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-center space-y-2">
              <CheckCircle2 size={32} className="mx-auto text-emerald-600 dark:text-emerald-400" />
              <h4 className="font-bold text-sm text-emerald-900 dark:text-emerald-100">
                آپ کا نمبر رجسٹر ہو گیا ہے!
              </h4>
              <p className="text-xs text-emerald-800 dark:text-emerald-200">
                ضلع {district} میں {crop} کی فصل پر کسی بھی شدید بیماری یا موسمی خطرے کے وقت آپ کو فوری الرٹ موصول ہوگا۔
              </p>
              <button
                type="button"
                onClick={() => setIsSubscribed(false)}
                className="text-xs text-emerald-700 dark:text-emerald-300 underline font-medium cursor-pointer"
              >
                Change subscription details
              </button>
            </div>
          )}

          {/* SMS Simulation Screen */}
          <div className="mt-4 pt-4 border-t border-earth-150 dark:border-earth-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-earth-500">
                Feature Phone SMS Preview
              </span>
              <button
                type="button"
                onClick={handleSendTestSms}
                className="text-[11px] font-bold text-crop-600 dark:text-crop-400 hover:underline cursor-pointer"
              >
                {testSent ? '✓ Sent to Phone' : 'Send Test Alert'}
              </button>
            </div>

            <div className="p-3 rounded-xl bg-earth-100 dark:bg-earth-800 border border-earth-200 dark:border-earth-700 font-mono text-xs leading-relaxed text-earth-800 dark:text-earth-200 select-text">
              <p className="text-[10px] text-earth-500 mb-1">From: 8171-CROPEX</p>
              <p>{previewSms}</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );

  return typeof document !== 'undefined'
    ? createPortal(modalContent, document.body)
    : modalContent;
}
