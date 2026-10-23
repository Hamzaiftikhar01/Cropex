import { Phone, MessageCircle, AlertTriangle, ShieldCheck, X, MapPin } from 'lucide-react';
import { EXTENSION_HELPLINES_PK, generateWhatsAppReferralUrl } from '../lib/pesticideRegistry';
import { useLanguage } from '../context/LanguageContext';

export default function ExpertEscalationModal({ isOpen, onClose, diagnosis, fieldDistrict }) {
  const { language } = useLanguage();
  const isUrdu = language === 'ur';

  if (!isOpen) return null;

  const currentDistrict = fieldDistrict || diagnosis?.district || 'Faisalabad';
  const whatsappUrl = generateWhatsAppReferralUrl({
    ...diagnosis,
    district: currentDistrict,
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in text-left">
      <div 
        className="relative w-full max-w-xl bg-white dark:bg-earth-900 rounded-3xl border border-earth-200 dark:border-earth-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="expert-modal-title"
      >
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-crop-700 via-crop-600 to-earth-800 text-white p-5 sm:p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-2 mb-1.5">
            <span className="bg-white/20 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase text-crop-100 flex items-center gap-1">
              <ShieldCheck size={12} />
              {isUrdu ? 'سرکاری زرعی معاونت' : 'Official Extension Referral'}
            </span>
            {diagnosis?.severity === 'High' && (
              <span className="bg-rose-500/80 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase text-white flex items-center gap-1">
                <AlertTriangle size={12} />
                {isUrdu ? 'فوری عمل درکار' : 'High Severity'}
              </span>
            )}
          </div>

          <h3 id="expert-modal-title" className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            {isUrdu ? 'ماہر زراعت سے فوری رابطہ' : 'Talk to an Agricultural Expert'}
          </h3>
          <p className="text-xs sm:text-sm text-crop-100/90 mt-1 font-medium leading-relaxed">
            {isUrdu
              ? 'تشخیص کی تصدیق اور مناسب کیمیائی علاج کے لیے اپنے ضلع کے سرٹیفائیڈ زرعی افسر سے رابطہ کریں۔'
              : 'Direct escalation to certified agricultural extension officers & research stations in Pakistan.'}
          </p>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-earth-850 dark:text-earth-150">
          
          {/* Active Case Summary Card */}
          <div className="p-3.5 bg-earth-50 dark:bg-earth-950/70 rounded-2xl border border-earth-150 dark:border-earth-800 flex items-center justify-between text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-earth-500 dark:text-earth-400 block">
                {isUrdu ? 'زیرِ معائنہ فصل' : 'Active Scan Case'}
              </span>
              <p className="font-bold text-sm text-earth-900 dark:text-earth-50 mt-0.5">
                {diagnosis?.cropName || diagnosis?.crop || 'Crop'} — {diagnosis?.disease || 'Condition'}
              </p>
              <div className="flex items-center gap-2 mt-1 text-[11px] text-earth-600 dark:text-earth-300">
                <span className="flex items-center gap-0.5"><MapPin size={12} /> {currentDistrict}</span>
                <span>•</span>
                <span>{isUrdu ? 'اعتماد' : 'Confidence'}: <strong>{diagnosis?.confidence || 85}%</strong></span>
              </div>
            </div>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors shadow-xs shrink-0 cursor-pointer"
            >
              <MessageCircle size={15} />
              <span>{isUrdu ? 'واٹس ایپ رابطہ' : 'WhatsApp'}</span>
            </a>
          </div>

          {/* Official Helplines Directory */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-earth-600 dark:text-earth-300">
              {isUrdu ? 'سرکاری ٹول فری کسان ہیلپ لائنز' : 'Government Toll-Free Agricultural Helplines'}
            </h4>

            {/* PARC National */}
            <div className="p-3 bg-white dark:bg-earth-850 rounded-xl border border-earth-200 dark:border-earth-750 flex items-center justify-between hover:border-crop-500/50 transition-colors">
              <div>
                <h5 className="text-xs font-bold text-earth-900 dark:text-earth-50">
                  {isUrdu ? EXTENSION_HELPLINES_PK.national.title_ur : EXTENSION_HELPLINES_PK.national.title}
                </h5>
                <p className="text-[11px] text-earth-500 dark:text-earth-400 mt-0.5">
                  {EXTENSION_HELPLINES_PK.national.hours}
                </p>
              </div>
              <a
                href={`tel:${EXTENSION_HELPLINES_PK.national.phone}`}
                className="px-3 py-1.5 bg-crop-50 hover:bg-crop-100 text-crop-800 dark:bg-crop-950/40 dark:text-crop-300 rounded-lg text-xs font-bold flex items-center gap-1.5 border border-crop-600/20"
              >
                <Phone size={13} />
                <span>{EXTENSION_HELPLINES_PK.national.phone}</span>
              </a>
            </div>

            {/* Punjab Extension */}
            <div className="p-3 bg-white dark:bg-earth-850 rounded-xl border border-earth-200 dark:border-earth-750 flex items-center justify-between hover:border-crop-500/50 transition-colors">
              <div>
                <h5 className="text-xs font-bold text-earth-900 dark:text-earth-50">
                  {isUrdu ? EXTENSION_HELPLINES_PK.punjab.title_ur : EXTENSION_HELPLINES_PK.punjab.title}
                </h5>
                <p className="text-[11px] text-earth-500 dark:text-earth-400 mt-0.5">
                  {EXTENSION_HELPLINES_PK.punjab.hours}
                </p>
              </div>
              <a
                href={`tel:${EXTENSION_HELPLINES_PK.punjab.tollFree}`}
                className="px-3 py-1.5 bg-crop-50 hover:bg-crop-100 text-crop-800 dark:bg-crop-950/40 dark:text-crop-300 rounded-lg text-xs font-bold flex items-center gap-1.5 border border-crop-600/20"
              >
                <Phone size={13} />
                <span>{EXTENSION_HELPLINES_PK.punjab.tollFree}</span>
              </a>
            </div>

            {/* Sindh Extension */}
            <div className="p-3 bg-white dark:bg-earth-850 rounded-xl border border-earth-200 dark:border-earth-750 flex items-center justify-between hover:border-crop-500/50 transition-colors">
              <div>
                <h5 className="text-xs font-bold text-earth-900 dark:text-earth-50">
                  {isUrdu ? EXTENSION_HELPLINES_PK.sindh.title_ur : EXTENSION_HELPLINES_PK.sindh.title}
                </h5>
                <p className="text-[11px] text-earth-500 dark:text-earth-400 mt-0.5">
                  {EXTENSION_HELPLINES_PK.sindh.hours}
                </p>
              </div>
              <a
                href={`tel:${EXTENSION_HELPLINES_PK.sindh.phone}`}
                className="px-3 py-1.5 bg-crop-50 hover:bg-crop-100 text-crop-800 dark:bg-crop-950/40 dark:text-crop-300 rounded-lg text-xs font-bold flex items-center gap-1.5 border border-crop-600/20"
              >
                <Phone size={13} />
                <span>{EXTENSION_HELPLINES_PK.sindh.phone}</span>
              </a>
            </div>

            {/* KPK Extension */}
            <div className="p-3 bg-white dark:bg-earth-850 rounded-xl border border-earth-200 dark:border-earth-750 flex items-center justify-between hover:border-crop-500/50 transition-colors">
              <div>
                <h5 className="text-xs font-bold text-earth-900 dark:text-earth-50">
                  {isUrdu ? EXTENSION_HELPLINES_PK.kpk.title_ur : EXTENSION_HELPLINES_PK.kpk.title}
                </h5>
                <p className="text-[11px] text-earth-500 dark:text-earth-400 mt-0.5">
                  {EXTENSION_HELPLINES_PK.kpk.hours}
                </p>
              </div>
              <a
                href={`tel:${EXTENSION_HELPLINES_PK.kpk.phone}`}
                className="px-3 py-1.5 bg-crop-50 hover:bg-crop-100 text-crop-800 dark:bg-crop-950/40 dark:text-crop-300 rounded-lg text-xs font-bold flex items-center gap-1.5 border border-crop-600/20"
              >
                <Phone size={13} />
                <span>{EXTENSION_HELPLINES_PK.kpk.phone}</span>
              </a>
            </div>
          </div>

          {/* Field Protocol Guidelines */}
          <div className="p-4 bg-amber-50/70 dark:bg-amber-950/30 rounded-2xl border border-amber-200 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-200">
            <h5 className="font-bold flex items-center gap-1.5 text-xs text-amber-800 dark:text-amber-300 mb-1">
              <AlertTriangle size={14} />
              {isUrdu ? 'نمونہ لینے کی ہدایات' : 'Field Sample Protocol for Agronomist Visit'}
            </h5>
            <ul className="list-disc list-inside space-y-1 text-[11px] leading-relaxed text-amber-800/90 dark:text-amber-300/90">
              <li>{isUrdu ? 'متاثرہ اور صحت مند دونوں حصوں کے 3 سے 5 پتے پلاسٹک بیگ میں محفوظ کریں۔' : 'Collect 3–5 symptomatic leaves showing margin between healthy and necrotic tissue.'}</li>
              <li>{isUrdu ? 'دھوپ میں سکھانے کی بجائے ٹھنڈی جگہ پر رکھ کر ضلعی دفتر پہنچائیں۔' : 'Place leaves in a clean, ventilated paper bag and avoid direct midday sunlight.'}</li>
              <li>{isUrdu ? 'غیر رجسٹرڈ یا کالی مارکیٹ کی بغیر لیبل ادویات ہرگز استعمال نہ کریں۔' : 'Never apply unlabelled or black-market pesticides without registration credentials.'}</li>
            </ul>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-earth-50 dark:bg-earth-950/80 border-t border-earth-150 dark:border-earth-800 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold bg-earth-200 hover:bg-earth-300 text-earth-800 dark:bg-earth-800 dark:hover:bg-earth-700 dark:text-earth-100 rounded-xl transition-colors cursor-pointer"
          >
            {isUrdu ? 'بند کریں' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
}
