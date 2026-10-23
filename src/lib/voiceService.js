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
    .replace(/\*\*([^*]+)\*\*/g, '$1') // bold
    .replace(/\*([^*]+)\*/g, '$1') // italic
    .replace(/#+\s+/g, '') // headers
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links
    .replace(/[•\-*]\s+/g, '') // bullet points
    .replace(/[_~>]/g, '') // quotes, strikethrough
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Stops any actively playing audio or SpeechSynthesis voice.
 */
export function stopSpeaking() {
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
  const encodedText = encodeURIComponent(text.slice(0, 300));
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
    // Upstream or network failed -> Fallback to browser SpeechSynthesis
    currentAudio = null;
    if (isCancelled) return;

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang === 'en' ? 'en-US' : 'ur-PK';
        utterance.rate = rate * 0.95;

        // Try to locate native Urdu / Hindi / Indian voice if available
        const voices = window.speechSynthesis.getVoices() || [];
        const preferredVoice = voices.find(
          (v) => v.lang.startsWith(lang) || v.lang.includes('ur') || v.lang.includes('hi')
        );
        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }

        utterance.onstart = () => {
          if (!isCancelled && onStart) onStart();
        };
        utterance.onend = () => {
          if (!isCancelled && onEnd) onEnd();
        };
        utterance.onerror = (e) => {
          if (!isCancelled && onError) onError(e);
        };

        window.speechSynthesis.speak(utterance);
      } catch (synthErr) {
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
