/**
 * AI API Service
 * --------------
 * Client-side proxy to Cropex's serverless API routes.
 * The Groq API key lives ONLY on the server (GROQ_API_KEY env var).
 * No secrets are ever shipped to the browser.
 *
 * All Groq calls go through:
 *   POST /api/analyze   — crop disease vision analysis
 *   POST /api/rephrase  — farm advisor rephrasing
 *   POST /api/chat      — chatbot
 */

// =============================================================================
// Constants
// =============================================================================

/** Max image dimension (px) before client-side compression kicks in */
const MAX_IMAGE_DIMENSION = 1024;

/** Max file size before we refuse to even compress (raw bytes) */
const MAX_RAW_FILE_BYTES = 20 * 1024 * 1024; // 20 MB

/** Accepted MIME types */
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/** Empty template matching core AI identification output */
export const EMPTY_AI_IDENTIFICATION = Object.freeze({
  crop: '',
  disease: '',
  confidence: 0,
  severity: '',
  description: '',
  visibleSymptoms: [],
  likelyCauses: [],
  recommendedActions: [],
  analysisSummary: '',
  disclaimer: '',
});

// =============================================================================
// Custom error
// =============================================================================

export class CropexServiceError extends Error {
  constructor(message, { code = 'SERVICE_ERROR', status = null, cause = null } = {}) {
    super(message);
    this.name = 'CropexServiceError';
    this.code = code;
    this.status = status;
    this.cause = cause;
  }
}

export const ServiceErrorCode = Object.freeze({
  INVALID_INPUT: 'INVALID_INPUT',
  REQUEST_FAILED: 'REQUEST_FAILED',
  TIMEOUT: 'TIMEOUT',
  RATE_LIMITED: 'RATE_LIMITED',
  PARSE_ERROR: 'PARSE_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
});

// =============================================================================
// Image helpers — validation & client-side compression
// =============================================================================

/**
 * Validates that a File is an accepted image type and within the raw size limit.
 * @param {File} file
 */
export function validateImageFile(file) {
  if (!(file instanceof File)) {
    throw new CropexServiceError('Expected a File object.', { code: ServiceErrorCode.INVALID_INPUT });
  }
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    throw new CropexServiceError(
      `Unsupported file type: ${file.type}. Please upload a JPG, PNG, or WebP image.`,
      { code: ServiceErrorCode.INVALID_INPUT }
    );
  }
  if (file.size > MAX_RAW_FILE_BYTES) {
    throw new CropexServiceError(
      `File is too large (${Math.round(file.size / 1024 / 1024)}MB). Max allowed is 20MB.`,
      { code: ServiceErrorCode.INVALID_INPUT }
    );
  }
}

/**
 * Compresses and resizes an image client-side using a Canvas.
 * Returns a base64 data URL (JPEG, quality 0.82, max 1024px).
 *
 * This dramatically reduces payload size before sending to the server,
 * keeping the base64 well under the 4MB server-side limit.
 *
 * @param {File} file
 * @returns {Promise<string>} base64 data URL
 */
export function compressImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;
      if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
        const ratio = Math.min(MAX_IMAGE_DIMENSION / width, MAX_IMAGE_DIMENSION / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      // Export as JPEG for maximum compression; PNG stays as PNG for transparency
      const mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
      const quality = mimeType === 'image/jpeg' ? 0.82 : undefined;

      const dataUrl = canvas.toDataURL(mimeType, quality);
      resolve(dataUrl);
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new CropexServiceError('Failed to load image for compression.', { code: ServiceErrorCode.INVALID_INPUT }));
    };

    img.src = objectUrl;
  });
}

// =============================================================================
// Internal API proxy helper
// =============================================================================

/**
 * POSTs to an internal /api/* route, handles errors, and returns the JSON body.
 * @param {string} path - e.g. '/api/analyze'
 * @param {object} body
 * @param {number} [timeoutMs]
 * @returns {Promise<object>}
 */
async function callApi(path, body, timeoutMs = 60_000) {
  const controller = new AbortController();
  const timerId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(path, {
      method: 'POST',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => ({}));

    if (res.status === 429) {
      throw new CropexServiceError(
        data.error || 'Too many requests. Please wait a moment and try again.',
        { code: ServiceErrorCode.RATE_LIMITED, status: 429 }
      );
    }

    if (!res.ok) {
      throw new CropexServiceError(
        data.error || `Server returned status ${res.status}.`,
        { code: ServiceErrorCode.REQUEST_FAILED, status: res.status }
      );
    }

    return data;

  } catch (err) {
    if (err instanceof CropexServiceError) throw err;

    if (err.name === 'AbortError') {
      throw new CropexServiceError('Request timed out. Please check your connection and try again.', {
        code: ServiceErrorCode.TIMEOUT,
      });
    }

    throw new CropexServiceError(
      `Network error: ${err.message}`,
      { code: ServiceErrorCode.REQUEST_FAILED, cause: err }
    );
  } finally {
    clearTimeout(timerId);
  }
}

// =============================================================================
// Public API — crop disease analysis
// =============================================================================

/** Confidence below this threshold triggers escalation guidance in the UI */
export const LOW_CONFIDENCE_THRESHOLD = 70;

/**
 * Compresses the image and sends it to the secure backend for disease analysis.
 * Phase 2: passes cropHint for scoped VLM prompting, adds escalation flag.
 *
 * @param {File|string} imageInput - File object or pre-made base64 data URL
 * @param {string} [cropHint] - Optional crop ID from fieldProfile (e.g. 'wheat')
 * @returns {Promise<object>} Structured diagnosis result
 */
export async function analyzeCropImage(imageInput, cropHint) {
  if (!imageInput) {
    throw new CropexServiceError('A crop image is required for analysis.', {
      code: ServiceErrorCode.INVALID_INPUT,
    });
  }

  let imageDataUrl;

  if (imageInput instanceof File) {
    validateImageFile(imageInput);
    // Compress client-side — reduces 4-10MB photos to ~200-400KB
    imageDataUrl = await compressImage(imageInput);
  } else if (typeof imageInput === 'string' && imageInput.startsWith('data:image/')) {
    imageDataUrl = imageInput;
  } else {
    throw new CropexServiceError('Invalid image input.', { code: ServiceErrorCode.INVALID_INPUT });
  }

  const payload = { image: imageDataUrl };
  if (cropHint) payload.cropHint = cropHint.toLowerCase().trim();

  const result = await callApi('/api/analyze', payload, 60_000);

  // Phase 2: attach escalation flag so UI can prompt farmer to retake / contact expert
  const confidence = typeof result.confidence === 'number' ? result.confidence : 100;
  result.needsEscalation = result.isCrop === true && confidence < LOW_CONFIDENCE_THRESHOLD;

  if (result.needsEscalation) {
    result.escalationActions = [
      'Retake the photo: use a close-up of the affected leaf in clear natural light.',
      'Include both the upper and lower leaf surfaces if possible.',
      'Contact your nearest Zila Agriculture Office or extension officer.',
      'Call the NARC helpline: 051-9255000.',
    ];
  }

  return result;
}

// =============================================================================
import { searchKnowledgeBase, formatRagContextForPrompt } from '../lib/ragSearch.js';

export { searchKnowledgeBase };

/**
 * Searches knowledge base via serverless API endpoint or local fallback.
 * @param {string} query
 * @param {object} [options]
 * @returns {Promise<object>}
 */
export async function queryRagKnowledgeBase(query, options = {}) {
  try {
    return await callApi('/api/rag', { query, ...options }, 15_000);
  } catch (_err) {
    // Graceful offline/local fallback
    return searchKnowledgeBase(query, options);
  }
}

/**
 * Sends conversation history to the secure chat proxy with RAG knowledge grounding.
 *
 * @param {Array<{role: string, content: string}>} messageHistory
 * @param {{ fieldProfile?: object, weatherData?: object }} contextData
 * @returns {Promise<{ reply: string, sources: Array<object> }>} Assistant reply and cited sources
 */
export async function generateChatResponse(messageHistory, contextData) {
  const { fieldProfile, weatherData } = contextData || {};

  // Extract latest user inquiry for RAG retrieval
  const lastUserMsg = [...messageHistory].reverse().find((m) => m.role === 'user')?.content || '';

  let ragContext = '';
  let sources = [];

  try {
    const cropId = fieldProfile?.cropType ? fieldProfile.cropType.toLowerCase() : null;
    const searchRes = searchKnowledgeBase(lastUserMsg, {
      cropId,
      limit: 4,
      minScore: 0.5,
    });

    if (searchRes.results && searchRes.results.length > 0) {
      sources = searchRes.results.map((r) => ({
        id: r.chunk.id,
        title: r.chunk.title,
        source: r.chunk.source,
        category: r.chunk.category,
        cropId: r.chunk.crop_id,
        diseaseId: r.chunk.disease_id,
        content: r.chunk.content,
        content_ur: r.chunk.content_ur || null,
        score: r.score,
      }));
      ragContext = formatRagContextForPrompt(searchRes.results);
    }
  } catch (ragErr) {
    console.warn('[aiService] RAG retrieval skipped:', ragErr);
  }

  const systemContent = `You are a highly intelligent, empathetic agricultural expert assistant for Cropex — an AI farming platform for Pakistan.
Prioritize local context: District: ${fieldProfile?.district || 'Unknown'}, Crop: ${fieldProfile?.cropType || 'Unknown'}.
Weather: ${weatherData ? `Temp ${weatherData.current?.temperature_2m ?? '?'}°C, Humidity ${weatherData.current?.relative_humidity_2m ?? '?'}%` : 'unavailable'}.
Only recommend treatments registered with the Pakistan Department of Plant Protection (DPP). Never invent chemical dosages — always state official label dosages or direct farmers to consult local extension officers.
BANNED SUBSTANCES: NEVER recommend banned or cancelled chemicals in Pakistan (Endosulfan, Monocrotophos, DDT, Dieldrin, Aldrin, Heptachlor, Methyl Parathion, Methamidophos, Phosphamidon, Chlordane).
Always advise respecting Pre-Harvest Intervals (PHI) for crop safety.
DISCLAIMER: Advice is AI-generated. Always verify with a certified agronomist.`;

  const messages = [
    { role: 'system', content: systemContent },
    ...messageHistory.map((m) => ({ role: m.role, content: m.content })),
  ];

  let data;
  try {
    data = await callApi('/api/chat', { messages, ragContext, sources }, 35_000);
  } catch (apiErr) {
    console.warn('[aiService] Chat API error, using grounded knowledge base response:', apiErr);
    if (sources && sources.length > 0) {
      const topChunk = sources[0];
      const otherCitations = sources.slice(1).map((s) => s.title).join(', ');
      const fallbackReply = `**${topChunk.title}**\n\n${topChunk.content}\n\n${
        topChunk.content_ur ? `\n\n*${topChunk.content_ur}*` : ''
      }\n\n📍 **Verified Source:** ${topChunk.source}${otherCitations ? `\n📚 **Related advisories:** ${otherCitations}` : ''}`;
      return {
        reply: fallbackReply,
        sources,
      };
    }
    throw apiErr;
  }

  const reply = data?.reply;

  if (typeof reply !== 'string') {
    throw new CropexServiceError('Unexpected chat response format.', {
      code: ServiceErrorCode.PARSE_ERROR,
    });
  }

  return {
    reply,
    sources: data?.sources || sources || [],
  };
}

// =============================================================================
// Localized crop tips (lightweight fallback — no API call needed)
// =============================================================================

/**
 * Returns a static localized tip for a crop in a given district.
 * Previously this called the LLM; replaced with a static fallback
 * to avoid unnecessary API spend on non-critical UI hints.
 *
 * @param {string} cropName
 * @param {string} district
 * @returns {string}
 */
export async function getLocalCropAdvice(cropName, district) {
  try {
    const cropId = cropName ? cropName.toLowerCase().trim() : null;
    const res = searchKnowledgeBase(`${cropName || ''} agronomy sowing guide`, {
      cropId,
      limit: 1,
    });
    if (res.results && res.results.length > 0) {
      return res.results[0].chunk.content;
    }
  } catch (_e) {
    // fallback
  }
  return `For best results in ${district || 'your area'}, consult your local agriculture extension office for the recommended sowing window and approved varieties of ${cropName}.`;
}

// =============================================================================
// Legacy compatibility (used by farmAdvisor.js)
// =============================================================================

/** @deprecated Use GROQ_API_KEY on the server — never expose key in the browser */
export function getGroqApiKey() {
  return null; // Always null — key lives on server only
}

export function isGroqConfigured() {
  return true; // Always true — /api/* routes handle the key
}
