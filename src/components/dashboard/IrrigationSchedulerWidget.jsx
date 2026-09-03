import { useLanguage } from '../../context/LanguageContext';
import { Droplets, Check } from 'lucide-react';

export default function IrrigationSchedulerWidget({ irrInfo, fieldProfile, onProfileChange }) {
  const { t, language } = useLanguage();

  if (!irrInfo || !fieldProfile) return null;

  const isUrdu = language === 'ur';
  const isPunjabi = language === 'pa';
  
  const handleIrrigatedToday = () => {
    // Setting lastIrrigatedDaysAgo to 0
    if (onProfileChange) {
      onProfileChange({
        ...fieldProfile,
        lastIrrigatedDaysAgo: 0,
        last_irrigated_at: new Date().toISOString()
      });
    }
  };

  // Determine styling and messaging based on irrInfo recommendation
  const isUrgent = irrInfo.recommendation === 'Irrigate Now' || irrInfo.recommendation === 'ابھی پانی دیں' || irrInfo.recommendation === 'اج ای پانی دیو';
  const isWarning = irrInfo.recommendation === 'Irrigate in 2 Days' || irrInfo.recommendation === '2 دن میں پانی دیں' || irrInfo.recommendation === '2 دن وچ پانی دیو';
  const isWait = irrInfo.recommendation === 'Wait / Skip' || irrInfo.recommendation === 'انتظار کریں (Wait)';

  let statusColor = 'bg-crop-500';
  let textColor = 'text-crop-600 dark:text-crop-400';
  let bgColor = 'bg-crop-50 dark:bg-crop-900/20';
  let borderColor = 'border-crop-200 dark:border-crop-800';
  
  if (isUrgent) {
    statusColor = 'bg-semantic-high';
    textColor = 'text-semantic-high';
    bgColor = 'bg-semantic-high/10';
    borderColor = 'border-semantic-high/30';
  } else if (isWarning) {
    statusColor = 'bg-semantic-medium';
    textColor = 'text-semantic-medium';
    bgColor = 'bg-semantic-medium/10';
    borderColor = 'border-semantic-medium/30';
  } else if (isWait) {
    statusColor = 'bg-blue-500';
    textColor = 'text-blue-500';
    bgColor = 'bg-blue-50 dark:bg-blue-900/20';
    borderColor = 'border-blue-200 dark:border-blue-800';
  }

  // Calculate days since last irrigation
  const daysAgo = fieldProfile.lastIrrigatedDaysAgo || 0;
  
  // Progress bar logic (assuming max 10 days for visualization scale)
  const maxDays = 10;
  const progressPercent = Math.min((daysAgo / maxDays) * 100, 100);

  return (
    <div id="irrigation-graph" className="bg-neutral-surface dark:bg-earth-900 border border-neutral-border dark:border-earth-800 rounded-2xl p-5 sm:p-6 shadow-soft transition-colors duration-200 mt-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 gap-3">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-neutral-high dark:text-earth-50 flex items-center gap-2">
            <Droplets size={24} className="text-blue-500" aria-hidden="true" /> {isUrdu ? 'اسمارٹ ایریگیشن شیڈولر' : isPunjabi ? 'اسمارٹ ایریگیشن شیڈولر' : 'Smart Irrigation Scheduler'}
          </h3>
          <p className="text-xs sm:text-sm text-neutral-medium dark:text-earth-300 mt-1">
            {isUrdu ? 'پانی کی ضرورت اور موجودہ حالت' : isPunjabi ? 'پانی دی ضرورت تے حالت' : 'Track your crop water requirements in real-time'}
          </p>
        </div>
      </div>

      <div className={`p-5 rounded-xl border ${bgColor} ${borderColor} mb-6 transition-colors duration-300`}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className={`w-3 h-3 rounded-full ${statusColor} animate-pulse`}></span>
              <span className={`text-sm font-bold uppercase tracking-wide ${textColor}`}>
                {irrInfo.recommendation}
              </span>
            </div>
            <p className="text-sm font-medium text-neutral-high dark:text-earth-100">
              {irrInfo.explanation}
            </p>
            {irrInfo.litersPerAcre > 0 && (
              <p className="text-xs font-bold text-neutral-medium dark:text-earth-400 mt-2">
                {isUrdu ? 'تجویز کردہ مقدار:' : isPunjabi ? 'مطلوبہ مقدار:' : 'Recommended Volume:'} {irrInfo.litersPerAcre.toLocaleString()} {t('litersAcre')}
              </p>
            )}
          </div>
          
          <div className="w-full sm:w-auto shrink-0 flex flex-col items-center gap-2 bg-neutral-surface/50 dark:bg-earth-950/50 p-3 rounded-lg border border-neutral-border dark:border-earth-800">
            <span className="text-xs font-semibold text-neutral-medium dark:text-earth-400 uppercase tracking-wider">
              {isUrdu ? 'آخری پانی:' : isPunjabi ? 'آخری پانی:' : 'Last Irrigated'}
            </span>
            <span className="text-2xl font-black text-neutral-high dark:text-earth-50">
              {daysAgo} {daysAgo === 1 ? (isUrdu ? 'دن پہلے' : 'Day Ago') : (isUrdu ? 'دن پہلے' : 'Days Ago')}
            </span>
          </div>
        </div>

        {/* Visual Timeline (Simulated Graph) */}
        <div className="mt-8 mb-2 px-2 relative">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-neutral-border dark:bg-earth-800 -translate-y-1/2 rounded-full"></div>
          {/* Active timeline line */}
          <div 
            className="absolute top-1/2 left-0 h-1 bg-blue-500 -translate-y-1/2 rounded-full transition-all duration-1000 ease-out" 
            style={{ width: '50%' }}
          ></div>
          <div className="relative flex justify-between">
            {/* Node 1: Past Irrigation (Simulated) */}
            <div className="flex flex-col items-center">
              <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white dark:border-earth-900 z-10"></div>
              <span className="text-[10px] font-bold text-neutral-medium dark:text-earth-400 mt-2 absolute top-4 whitespace-nowrap -translate-x-1/2 left-1/2">
                {isUrdu ? 'پچھلا' : isPunjabi ? 'پچھلا' : 'Previous'}
              </span>
            </div>
            {/* Node 2: Last Irrigated (Truth) */}
            <div className="flex flex-col items-center">
              <div className="w-5 h-5 bg-blue-500 rounded-full border-2 border-white dark:border-earth-900 z-10 flex items-center justify-center shadow-soft">
                <Check size={12} className="text-white" />
              </div>
              <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 mt-2 absolute top-4 whitespace-nowrap -translate-x-1/2 left-1/2">
                {isUrdu ? 'آخری پانی' : isPunjabi ? 'آخری پانی' : 'Last'} (-{daysAgo}d)
              </span>
            </div>
            {/* Node 3: Current/Next */}
            <div className="flex flex-col items-center">
              <div className={`w-5 h-5 rounded-full border-2 border-white dark:border-earth-900 z-10 flex items-center justify-center ${daysAgo === 0 ? 'bg-blue-300' : isUrgent ? 'bg-semantic-high animate-pulse' : isWarning ? 'bg-semantic-medium' : 'bg-neutral-border dark:bg-earth-700'}`}>
                 {isUrgent && <Droplets size={12} className="text-white" />}
              </div>
              <span className={`text-[10px] font-bold mt-2 absolute top-4 whitespace-nowrap -translate-x-1/2 left-1/2 ${isUrgent ? 'text-semantic-high' : isWarning ? 'text-semantic-medium' : 'text-neutral-medium dark:text-earth-400'}`}>
                {isUrdu ? 'اگلا پانی' : isPunjabi ? 'اگلا پانی' : 'Target'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={handleIrrigatedToday}
        disabled={daysAgo === 0}
        className={`w-full h-12 rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition-all ${
          daysAgo === 0 
            ? 'bg-neutral-fill dark:bg-earth-800 text-neutral-low dark:text-earth-500 cursor-not-allowed border border-neutral-border dark:border-earth-700' 
            : 'bg-brand-primary hover:bg-brand-secondary text-white cursor-pointer shadow-soft hover:shadow-card hover:-translate-y-0.5'
        }`}
      >
        <Check size={20} className="mr-1 inline" aria-hidden="true" /> 
        {daysAgo === 0 
          ? (isUrdu ? 'آج پانی دیا جا چکا ہے' : isPunjabi ? 'اج پانی دتا گیا اے' : 'Already Irrigated Today') 
          : (isUrdu ? 'کھیت کو آج پانی دے دیا گیا' : isPunjabi ? 'اج پانی لا دتا گیا اے' : 'Mark as Irrigated Today')}
      </button>
    </div>
  );
}
