import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Send, Camera, Volume2, VolumeX, PhoneCall, CheckCheck } from 'lucide-react';
import { speakText, stopSpeaking } from '../lib/voiceService';
import { generateWhatsAppReferralUrl } from '../lib/pesticideRegistry';

export default function WhatsAppBotModal({ isOpen, onClose, defaultCrop = 'Wheat' }) {
  const [messages, setMessages] = useState([
    {
      id: 'm1',
      sender: 'bot',
      text: 'السلام علیکم کسان بھائی! 🌱\nکراپیکس واٹس ایپ بوٹ میں خوش آمدید۔\nاپنی متاثرہ فصل کے پتے کی تصویر بھیجیں یا مسئلہ لکھ کر بتائیں۔',
      time: '10:00 AM',
    },
    {
      id: 'm2',
      sender: 'bot',
      text: 'Assalam-o-Alaikum! Welcome to Cropex WhatsApp Farm Bot. Send a photo of your infected crop leaf or ask any disease question.',
      time: '10:01 AM',
    },
  ]);

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const chatBottomRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      const handleKeyDown = (e) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);

      return () => {
        document.body.style.overflow = prevOverflow;
        window.removeEventListener('keydown', handleKeyDown);
        stopSpeaking();
        setIsPlayingAudio(false);
      };
    }
  }, [isOpen, messages, onClose]);

  if (!isOpen) return null;

  const simulatePhotoDiagnosis = (cropName = 'Wheat', diseaseName = 'Yellow (Stripe) Rust') => {
    const userMsgId = `usr_${Date.now()}`;
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // 1. User sends photo
    setMessages((prev) => [
      ...prev,
      {
        id: userMsgId,
        sender: 'user',
        isImage: true,
        caption: `Leaf photo sent from field (${cropName})`,
        time: now,
      },
    ]);

    setIsTyping(true);

    // 2. Bot reply after short delay
    setTimeout(() => {
      setIsTyping(false);
      const diagnosisText = `🌿 *کراپیکس زرعی تشخیص (Crop Diagnosis)*
━━━━━━━━━━━━━━━━━━━
• *فصل (Crop):* ${cropName}
• *بیماری (Disease):* ${diseaseName}
• *شدت (Severity):* Moderate (درمیانی)
• *یقین (Confidence):* 89%
• *رجسٹرڈ دوا (DPP Approved):* Amistar Top (Azoxystrobin + Difenoconazole)
• *لیبل خوراک (Label Dose):* 200 ml in 100–120L water/acre
• *حفاظتی وقفہ (PHI):* 30 دن کٹائی سے پہلے
━━━━━━━━━━━━━━━━━━━
حفاظتی تدابیر: سپرے کرتے وقت دستانے اور ماسک لازمی پہنیں۔`;

      setMessages((prev) => [
        ...prev,
        {
          id: `bot_${Date.now()}`,
          sender: 'bot',
          text: diagnosisText,
          hasAudioNote: true,
          audioText: `${cropName} کی فصل میں ${diseaseName} کی علامات پائی گئی ہیں۔ محکمہ زراعت کی رجسٹرڈ دوا ایمسٹار ٹاپ دو سو ملی لیٹر فی ایکڑ کے حساب سے سپرے کریں۔ کٹائی سے تیس دن پہلے سپرے بند کر دیں۔`,
          crop: cropName,
          disease: diseaseName,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }, 1400);
  };

  const handleSendText = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input.trim();
    setInput('');
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setMessages((prev) => [
      ...prev,
      {
        id: `usr_${Date.now()}`,
        sender: 'user',
        text: userText,
        time: now,
      },
    ]);

    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `bot_${Date.now()}`,
          sender: 'bot',
          text: `وعلیکم السلام! آپ کی معلومات موصول ہو گئی ہیں۔ درست رہنمائی کے لیے پودے کے پتے کی واضح تصویر کیمرے والے بٹن سے بھیجیں تاکہ اے آئی ماڈل فوری معائنہ کر سکے۔\n\nFor best results, tap the Camera icon to send a photo of the infected leaf.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }, 1200);
  };

  const handlePlayVoiceNote = (speechText) => {
    if (isPlayingAudio) {
      stopSpeaking();
      setIsPlayingAudio(false);
      return;
    }

    setIsPlayingAudio(true);
    speakText(speechText, {
      lang: 'ur',
      onEnd: () => setIsPlayingAudio(false),
      onError: () => setIsPlayingAudio(false),
    });
  };

  const modalContent = (
    <div 
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in text-left"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* WhatsApp Window Wrapper */}
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md h-[620px] max-h-[92vh] flex flex-col rounded-3xl overflow-hidden shadow-2xl bg-[#EFEAE2] dark:bg-[#0b141a] border border-earth-300 dark:border-earth-800"
      >
        
        {/* WhatsApp Top Green Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#075E54] dark:bg-[#202c33] text-white shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-white shadow-inner">
                🌾
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#075E54]"></span>
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-wide flex items-center gap-1.5">
                Cropex WhatsApp Bot
                <span className="text-[10px] px-1.5 py-0.2 bg-emerald-700/80 rounded font-normal">Official</span>
              </h3>
              <p className="text-[11px] text-emerald-100/90 font-medium">Online (Photo In → Diagnosis Out)</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="tel:080015000"
              title="Call Kissan Helpline"
              className="p-2 rounded-full hover:bg-white/10 transition text-white"
            >
              <PhoneCall size={18} />
            </a>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/10 transition text-white cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* WhatsApp Chat Messages Stream */}
        <div className="flex-1 p-3.5 overflow-y-auto space-y-3 font-sans">
          {/* WhatsApp Encryption Notice */}
          <div className="flex justify-center my-1">
            <span className="text-[10px] bg-[#FFEECD] dark:bg-[#182229] text-amber-900 dark:text-amber-200/80 px-3 py-1 rounded-lg shadow-2xs text-center max-w-xs">
              🔒 Connected to Cropex AI Verified Agronomy Engine. Instant Urdu visual diagnosis.
            </span>
          </div>

          {messages.map((m) => {
            const isUser = m.sender === 'user';
            return (
              <div
                key={m.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} animate-fade-in`}
              >
                <div
                  className={`relative max-w-[85%] rounded-2xl p-3 shadow-xs text-xs sm:text-[13px] leading-relaxed ${
                    isUser
                      ? 'bg-[#E7FFDB] dark:bg-[#005c4b] text-[#111B21] dark:text-[#E9EDEF] rounded-tr-xs'
                      : 'bg-white dark:bg-[#202c33] text-[#111B21] dark:text-[#E9EDEF] rounded-tl-xs'
                  }`}
                >
                  {m.isImage && (
                    <div className="mb-2 rounded-xl overflow-hidden bg-emerald-800/20 p-4 text-center border border-emerald-500/30">
                      <div className="text-3xl">🍃</div>
                      <p className="mt-1 text-[11px] font-bold text-emerald-800 dark:text-emerald-200">
                        {m.caption}
                      </p>
                    </div>
                  )}

                  {m.text && <p className="whitespace-pre-line select-text">{m.text}</p>}

                  {/* Audio Voice Note Player in WhatsApp Bubble */}
                  {m.hasAudioNote && (
                    <div className="mt-3 pt-2.5 border-t border-earth-150 dark:border-earth-750">
                      <button
                        type="button"
                        onClick={() => handlePlayVoiceNote(m.audioText)}
                        className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 font-bold text-xs hover:bg-emerald-100 transition cursor-pointer"
                      >
                        {isPlayingAudio ? (
                          <>
                            <VolumeX size={16} className="text-emerald-600 animate-pulse" />
                            <span>Stop Voice Note (آواز بند کریں)</span>
                          </>
                        ) : (
                          <>
                            <Volume2 size={16} className="text-emerald-600" />
                            <span>Listen to Voice Note (اردو آواز سنیں)</span>
                          </>
                        )}
                      </button>

                      <div className="mt-2 flex items-center justify-between gap-2">
                        <a
                          href={generateWhatsAppReferralUrl({ cropName: m.crop, disease: m.disease })}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 hover:underline flex items-center gap-1"
                        >
                          <span>Forward to Agronomist</span>
                          <span>→</span>
                        </a>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-earth-400 dark:text-earth-450">
                    <span>{m.time}</span>
                    {isUser && <CheckCheck size={14} className="text-blue-500" />}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex items-center gap-1.5 p-2 rounded-xl bg-white dark:bg-[#202c33] w-20 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce"></span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]"></span>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Quick Diagnostic Presets Bar */}
        <div className="px-3 py-2 bg-[#f0f2f5] dark:bg-[#111b21] border-t border-earth-200 dark:border-earth-800 flex items-center gap-2 overflow-x-auto text-[11px]">
          <span className="text-earth-500 shrink-0 font-medium">Quick Photo:</span>
          <button
            type="button"
            onClick={() => simulatePhotoDiagnosis('Wheat', 'Yellow (Stripe) Rust')}
            className="px-2.5 py-1 rounded-full bg-white dark:bg-earth-800 text-earth-800 dark:text-earth-200 font-bold border border-earth-300 dark:border-earth-700 hover:border-emerald-500 shrink-0 cursor-pointer shadow-2xs"
          >
            🌾 Wheat Rust
          </button>
          <button
            type="button"
            onClick={() => simulatePhotoDiagnosis('Cotton', 'Cotton Bacterial Blight')}
            className="px-2.5 py-1 rounded-full bg-white dark:bg-earth-800 text-earth-800 dark:text-earth-200 font-bold border border-earth-300 dark:border-earth-700 hover:border-emerald-500 shrink-0 cursor-pointer shadow-2xs"
          >
            🌿 Cotton Blight
          </button>
          <button
            type="button"
            onClick={() => simulatePhotoDiagnosis('Potato', 'Late Blight')}
            className="px-2.5 py-1 rounded-full bg-white dark:bg-earth-800 text-earth-800 dark:text-earth-200 font-bold border border-earth-300 dark:border-earth-700 hover:border-emerald-500 shrink-0 cursor-pointer shadow-2xs"
          >
            🥔 Potato Blight
          </button>
        </div>

        {/* Bottom Input Field */}
        <form
          onSubmit={handleSendText}
          className="p-2.5 bg-[#f0f2f5] dark:bg-[#202c33] border-t border-earth-200 dark:border-earth-800 flex items-center gap-2 shrink-0"
        >
          <button
            type="button"
            onClick={() => simulatePhotoDiagnosis(defaultCrop, 'Leaf Disease')}
            title="Send Leaf Photo"
            className="p-2 rounded-full text-earth-600 dark:text-earth-300 hover:bg-earth-200 dark:hover:bg-earth-700 cursor-pointer transition"
          >
            <Camera size={20} />
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type in Urdu or English..."
            className="flex-1 bg-white dark:bg-[#2a3942] text-earth-900 dark:text-earth-100 rounded-full px-4 py-2 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 border-none shadow-2xs"
          />

          <button
            type="submit"
            className="p-2.5 rounded-full bg-[#00A884] text-white hover:bg-[#008f6f] transition shadow-xs cursor-pointer"
          >
            <Send size={16} />
          </button>
        </form>

      </div>
    </div>
  );

  return typeof document !== 'undefined'
    ? createPortal(modalContent, document.body)
    : modalContent;
}
