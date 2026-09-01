/**
 * Cropex Voice Synthesis Engine
 * -------------------------------------------------------------
 * Speaks in native Urdu (ur), native Shahmukhi Punjabi (pa), or native English (en)
 * matching the selected language mode.
 */

let activeAudio = null;
let isCancelled = false;
let currentUtterance = null;
let keepAliveTimer = null;

/**
 * Split text into short, natural sentences for smooth continuous streaming
 */
function splitIntoSentences(text) {
  if (!text || typeof text !== 'string') return [];
  // Split on punctuation: Urdu full stop '۔', English full stop '.', '!', '?'
  const rawParts = text.split(/([۔.!?\n\r]+)/g).filter(Boolean);
  const sentences = [];
  let buffer = '';

  for (let i = 0; i < rawParts.length; i++) {
    const part = rawParts[i].trim();
    if (!part) continue;

    if (/^[۔.!?\n\r]+$/.test(part)) {
      buffer += part;
      if (buffer.trim()) {
        sentences.push(buffer.trim());
        buffer = '';
      }
    } else {
      if (buffer) {
        sentences.push(buffer.trim());
        buffer = '';
      }
      buffer = part;
    }
  }

  if (buffer.trim()) {
    sentences.push(buffer.trim());
  }

  return sentences.filter(s => s.length > 1);
}

/**
 * Stop any active voice stream or speech synthesis immediately
 */
export function stopVoice() {
  isCancelled = true;

  if (activeAudio) {
    activeAudio.pause();
    activeAudio.currentTime = 0;
    activeAudio = null;
  }

  if (keepAliveTimer) {
    clearInterval(keepAliveTimer);
    keepAliveTimer = null;
  }

  currentUtterance = null;

  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Play authentic voice in Urdu, Punjabi, or English
 */
export async function speakInSelectedLanguage({ text, language = 'en', onStart, onEnd, onError }) {
  stopVoice();
  isCancelled = false;

  if (!text || typeof text !== 'string') {
    if (onEnd) onEnd();
    return;
  }

  if (onStart) onStart();

  const sentences = splitIntoSentences(text);
  if (sentences.length === 0) {
    if (onEnd) onEnd();
    return;
  }

  // Strategy 1: Stream native Neural Audio via /api/tts endpoint
  let streamFailed = false;

  for (let i = 0; i < sentences.length; i++) {
    if (isCancelled) break;
    const sentence = sentences[i];
    const ttsUrl = `/api/tts?lang=${encodeURIComponent(language)}&text=${encodeURIComponent(sentence)}`;

    try {
      await new Promise((resolve, reject) => {
        if (isCancelled) {
          resolve();
          return;
        }

        const audio = new Audio(ttsUrl);
        activeAudio = audio;

        audio.onended = () => {
          activeAudio = null;
          resolve();
        };

        audio.onerror = (e) => {
          activeAudio = null;
          reject(e);
        };

        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            activeAudio = null;
            reject(err);
          });
        }
      });
    } catch (err) {
      console.warn('Audio stream fallback to Web Speech:', err);
      streamFailed = true;
      break;
    }
  }

  if (isCancelled) {
    if (onEnd) onEnd();
    return;
  }

  // If streaming finished successfully
  if (!streamFailed) {
    if (onEnd) onEnd();
    return;
  }

  // Strategy 2: Web Speech API Fallback (Offline)
  playWebSpeechFallback({ text, language, onEnd, onError });
}

/**
 * Fallback to browser-native speechSynthesis
 */
function playWebSpeechFallback({ text, language, onEnd, onError }) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    if (onError) onError('Speech synthesis not supported in this browser.');
    return;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  currentUtterance = utterance;

  if (language === 'en') {
    utterance.lang = 'en-US';
    utterance.rate = 0.95;
  } else {
    utterance.lang = 'ur-PK';
    utterance.rate = 0.88;
  }

  const voices = window.speechSynthesis.getVoices() || [];
  const targetPrefix = language === 'en' ? 'en' : 'ur';
  const matchedVoice = voices.find(v => v.lang.toLowerCase().startsWith(targetPrefix));
  if (matchedVoice) {
    utterance.voice = matchedVoice;
  }

  utterance.onstart = () => {
    if (keepAliveTimer) clearInterval(keepAliveTimer);
    keepAliveTimer = setInterval(() => {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      } else {
        clearInterval(keepAliveTimer);
        keepAliveTimer = null;
      }
    }, 10000);
  };

  utterance.onend = () => {
    if (keepAliveTimer) {
      clearInterval(keepAliveTimer);
      keepAliveTimer = null;
    }
    currentUtterance = null;
    if (onEnd) onEnd();
  };

  utterance.onerror = (e) => {
    console.warn('Web Speech error:', e);
    if (keepAliveTimer) {
      clearInterval(keepAliveTimer);
      keepAliveTimer = null;
    }
    currentUtterance = null;
    if (onEnd) onEnd();
  };

  window.speechSynthesis.speak(utterance);
}
