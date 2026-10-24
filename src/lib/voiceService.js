/**
 * Cropex Phase 6 — Farmer Voice Accessibility Service
 * ===================================================
 * Sourced for Pakistani smallholder farmers with limited literacy.
 * Features:
 * 1. Urdu & English Speech-to-Text (STT) via Web Speech Recognition API (ur-PK, en-US)
 * 2. Dual-Engine Text-to-Speech (TTS): High-fidelity stream via /api/tts proxy + SpeechSynthesis fallback
 * 3. Text sanitization for natural spoken Urdu phonetics
 */

let currentAudio = null;

/**
 * Checks if Speech Recognition is supported in the current browser.
 * @returns {boolean}
 */
export function isSpeechRecognitionSupported() {
  if (typeof window === 'undefined') return false;
  return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
}

/**
 * Initiates speech recognition for voice queries.
 *
 * @param {object} options
 * @param {string} [options.lang='ur-PK'] - 'ur-PK' (Urdu) or 'en-US' (English)
 * @param {function} options.onResult - Callback with transcribed text (transcript, isFinal)
 * @param {function} [options.onError] - Error callback
 * @param {function} [options.onEnd] - End callback
 * @returns {object|null} Controller with stop() and abort() methods
 */
export function startListening({ lang = 'ur-PK', onResult, onError, onEnd }) {
  if (!isSpeechRecognitionSupported()) {
    if (onError) onError(new Error('Speech recognition is not supported in this browser.'));
    return null;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();

  recognition.lang = lang;
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;

  recognition.onresult = (event) => {
    let interimTranscript = '';
    let finalTranscript = '';

    for (let i = event.resultIndex; i < event.results.length; ++i) {
      const item = event.results[i];
      if (item.isFinal) {
        finalTranscript += item[0].transcript;
      } else {
        interimTranscript += item[0].transcript;
      }
    }

    const text = finalTranscript || interimTranscript;
    if (onResult && text) {
      onResult(text.trim(), Boolean(finalTranscript));
    }
  };

  recognition.onerror = (event) => {
    console.warn('[voiceService] Speech recognition error:', event.error);
    if (onError) onError(event);
  };

  recognition.onend = () => {
    if (onEnd) onEnd();
  };

  try {
    recognition.start();
    return {
      stop: () => {
        try {
          recognition.stop();
        } catch {
          // Ignore
        }
      },
      abort: () => {
        try {
          recognition.abort();
        } catch {
          // Ignore
        }
      },
    };
  } catch (err) {
    if (onError) onError(err);
    return null;
  }
}

/**
 * Strips markdown, emojis, HTML tags, and code blocks for fluid voice synthesis.
 * @param {string} text
 * @returns {string} Clean speech text
 */
export function cleanTextForSpeech(text) {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/```[\s\S]*?```/g, '') // remove code blocks
    .replace(/`([^`]+)`/g, '$1') // inline code
    .replace(/https?:\/\/\S+/g, '') // remove URLs
    .replace(/\[[^\]]*\]\([^)]*\)/g, '') // remove markdown links
    .replace(/\[[^\]]*\]/g, '') // remove bracket citations [1], [DPP]
    .replace(/\*\*([^*]+)\*\*/g, '$1') // bold
    .replace(/\*([^*]+)\*/g, '$1') // italic
    .replace(/#+\s+/g, '') // headers
    .replace(/^\s*[-•*]\s+/gm, '') // bullet points
    .replace(/^\s*\d+\.\s+/gm, '') // numbered lists
    .replace(/[_~>]/g, '') // quotes, strikethrough
    .replace(/&nbsp;/g, ' ')
    .replace(/[|\\/]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Stops any actively playing audio or SpeechSynthesis voice.
 */
let synthInterval = null;

export function stopSpeaking() {
  if (synthInterval) {
    clearInterval(synthInterval);
    synthInterval = null;
  }

  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    } catch {
      // Ignore
    }
    currentAudio = null;
  }

  if (typeof window !== 'undefined' && window.speechSynthesis) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // Ignore
    }
  }
}

/**
 * Speaks text aloud in Urdu or English using dual-engine audio pipeline.
 *
 * @param {string} rawText - Text or markdown content to speak
 * @param {object} [options]
 * @param {string} [options.lang='ur'] - 'ur' or 'en'
 * @param {number} [options.rate=1.0] - Speech rate
 * @param {function} [options.onStart] - Callback when audio begins
 * @param {function} [options.onEnd] - Callback when audio finishes
 * @param {function} [options.onError] - Callback on error
 * @returns {object} Controller { cancel: () => void }
 */
export function speakText(rawText, options = {}) {
  const { lang = 'ur', rate = 1.0, onStart, onEnd, onError } = options;
  const text = cleanTextForSpeech(rawText);

  if (!text) {
    if (onEnd) onEnd();
    return { cancel: () => {} };
  }

  stopSpeaking();

  let isCancelled = false;

  // Primary Engine: High-fidelity Serverless TTS endpoint (/api/tts)
  // Sends up to 1000 characters of sanitized, fluent text
  const speechText = text.slice(0, 1000);
  const encodedText = encodeURIComponent(speechText);
  const ttsUrl = `/api/tts?lang=${lang}&text=${encodedText}`;

  const audio = new Audio(ttsUrl);
  currentAudio = audio;
  audio.playbackRate = rate;

  audio.onplay = () => {
    if (!isCancelled && onStart) onStart();
  };

  audio.onended = () => {
    currentAudio = null;
    if (!isCancelled && onEnd) onEnd();
  };

  audio.onerror = () => {
    // Upstream or network failed -> Fallback to browser SpeechSynthesis with stall protection
    currentAudio = null;
    if (isCancelled) return;

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();

        // Split long text into short sentences to avoid Chromium 15-second speech freeze bug
        const sentences = speechText.match(/[^۔!؟\n.?]+[۔!؟\n.?]*/g) || [speechText];
        const voices = window.speechSynthesis.getVoices() || [];

        // Locate best native Urdu or compatible South Asian voice
        const preferredVoice = voices.find(
          (v) =>
            v.lang === 'ur-PK' ||
            v.lang === 'ur' ||
            v.lang.toLowerCase().includes('urdu') ||
            (lang === 'ur' && (v.lang === 'hi-IN' || v.lang.startsWith('hi'))) ||
            (lang === 'en' && (v.lang === 'en-US' || v.lang === 'en-GB'))
        );

        let currentIdx = 0;
        let started = false;

        // Keepalive timer prevents Chrome from freezing/stalling speech synthesis
        synthInterval = setInterval(() => {
          if (window.speechSynthesis.speaking) {
            window.speechSynthesis.pause();
            window.speechSynthesis.resume();
          } else {
            clearInterval(synthInterval);
            synthInterval = null;
          }
        }, 8000);

        const speakNext = () => {
          if (isCancelled || currentIdx >= sentences.length) {
            if (synthInterval) {
              clearInterval(synthInterval);
              synthInterval = null;
            }
            if (!isCancelled && onEnd) onEnd();
            return;
          }

          const sText = sentences[currentIdx].trim();
          if (!sText) {
            currentIdx++;
            speakNext();
            return;
          }

          const utterance = new SpeechSynthesisUtterance(sText);
          utterance.lang = lang === 'en' ? 'en-US' : 'ur-PK';
          utterance.rate = rate * 0.95;
          if (preferredVoice) utterance.voice = preferredVoice;

          utterance.onstart = () => {
            if (!started && !isCancelled && onStart) {
              started = true;
              onStart();
            }
          };

          utterance.onend = () => {
            currentIdx++;
            speakNext();
          };

          utterance.onerror = (e) => {
            console.warn('[voiceService] Synthesis utterance error:', e);
            currentIdx++;
            speakNext();
          };

          window.speechSynthesis.speak(utterance);
        };

        speakNext();
      } catch (synthErr) {
        if (synthInterval) clearInterval(synthInterval);
        if (onError) onError(synthErr);
      }
    } else if (onError) {
      onError(new Error('Text-to-speech audio service is currently unavailable.'));
    }
  };

  audio.play().catch(() => {
    // If browser autoplay policies block audio without prior interaction, trigger fallback
    if (audio.onerror) audio.onerror(new Event('autoplay_blocked'));
  });

  return {
    cancel: () => {
      isCancelled = true;
      stopSpeaking();
    },
  };
}
