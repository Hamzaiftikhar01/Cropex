/**
 * AI API Service
 * --------------
 * Reusable client for CropMedic AI's Groq-powered crop disease identification.
 * Uses the OpenAI-compatible Chat Completions API with the Llama-4-Scout-17b vision model.
 *
 * Environment: set VITE_GROQ_API_KEY in your .env file (never commit the key).
 */

// =============================================================================
// Configuration constants
// =============================================================================

/** Groq OpenAI-compatible API base URL */
export const GROQ_BASE_URL = 'https://api.groq.com/openai/v1';

/** Vision-capable model used for all crop analysis requests */
export const GROQ_MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct';

/** Default request timeout in milliseconds */
const REQUEST_TIMEOUT_MS = 60_000;

/** Chat completions endpoint path (appended to GROQ_BASE_URL) */
const CHAT_COMPLETIONS_PATH = '/chat/completions';

// =============================================================================
// Structured identification schema
// =============================================================================

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
});

// =============================================================================
// Custom error handling
// =============================================================================

export class GroqServiceError extends Error {
  constructor(message, { code = 'GROQ_ERROR', status = null, cause = null } = {}) {
    super(message);
    this.name = 'GroqServiceError';
    this.code = code;
    this.status = status;
    this.cause = cause;
  }
}

export const GroqErrorCode = Object.freeze({
  MISSING_API_KEY: 'MISSING_API_KEY',
  INVALID_INPUT: 'INVALID_INPUT',
  REQUEST_FAILED: 'REQUEST_FAILED',
  TIMEOUT: 'TIMEOUT',
  PARSE_ERROR: 'PARSE_ERROR',
});

async function parseApiError(response) {
  let detail = response.statusText;
  try {
    const body = await response.json();
    detail = body?.error?.message ?? body?.message ?? detail;
  } catch {
    // Response body is not JSON — keep statusText
  }
  return new GroqServiceError(`Groq API error (${response.status}): ${detail}`, {
    code: GroqErrorCode.REQUEST_FAILED,
    status: response.status,
  });
}

// =============================================================================
// API key & configuration helpers
// =============================================================================

export function getGroqApiKey() {
  const key = import.meta.env.VITE_GROQ_API_KEY;
  return typeof key === 'string' && key.trim().length > 0 ? key.trim() : null;
}

export function isGroqConfigured() {
  return getGroqApiKey() !== null;
}

function requireApiKey() {
  const apiKey = getGroqApiKey();
  if (!apiKey) {
    throw new GroqServiceError(
      'Groq API key is not configured. Add VITE_GROQ_API_KEY to your .env file.',
      { code: GroqErrorCode.MISSING_API_KEY },
    );
  }
  return apiKey;
}

// =============================================================================
// Low-level HTTP client
// =============================================================================

async function groqRequest(path, options = {}) {
  const apiKey = requireApiKey();
  const url = `${GROQ_BASE_URL}${path}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw await parseApiError(response);
    }

    return response.json();
  } catch (error) {
    if (error instanceof GroqServiceError) {
      throw error;
    }

    if (error.name === 'AbortError') {
      throw new GroqServiceError('Groq API request timed out.', {
        code: GroqErrorCode.TIMEOUT,
        cause: error,
      });
    }

    throw new GroqServiceError(
      `Network error while contacting Groq API: ${error.message}`,
      { code: GroqErrorCode.REQUEST_FAILED, cause: error },
    );
  } finally {
    clearTimeout(timeoutId);
  }
}

// =============================================================================
// Chat completions (foundation for image + text analysis)
// =============================================================================

export async function createChatCompletion(messages, { model = GROQ_MODEL, temperature = 0.2, maxTokens = 1024, responseFormat = null } = {}) {
  if (!Array.isArray(messages) || messages.length === 0) {
    throw new GroqServiceError('Messages array is required and must not be empty.', {
      code: GroqErrorCode.INVALID_INPUT,
    });
  }

  const payload = {
    model,
    messages,
    temperature,
    max_tokens: maxTokens,
  };

  if (responseFormat) {
    payload.response_format = responseFormat;
  }

  return groqRequest(CHAT_COMPLETIONS_PATH, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// =============================================================================
// Image helpers
// =============================================================================

export async function fileToBase64DataUrl(file) {
  if (!(file instanceof File)) {
    throw new GroqServiceError('Expected a File object for image conversion.', {
      code: GroqErrorCode.INVALID_INPUT,
    });
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(
          new GroqServiceError('Failed to read image file.', {
            code: GroqErrorCode.INVALID_INPUT,
          }),
        );
      }
    };

    reader.onerror = () => {
      reject(
        new GroqServiceError('Error reading image file.', {
          code: GroqErrorCode.INVALID_INPUT,
          cause: reader.error,
        }),
      );
    };

    reader.readAsDataURL(file);
  });
}

export function buildVisionMessage(prompt, imageDataUrl) {
  if (typeof prompt !== 'string' || prompt.trim().length === 0) {
    throw new GroqServiceError('Analysis prompt must be a non-empty string.', {
      code: GroqErrorCode.INVALID_INPUT,
    });
  }

  if (typeof imageDataUrl !== 'string' || !imageDataUrl.startsWith('data:image/')) {
    throw new GroqServiceError('Image must be a valid base64 data URL.', {
      code: GroqErrorCode.INVALID_INPUT,
    });
  }

  return {
    role: 'user',
    content: [
      { type: 'text', text: prompt },
      { type: 'image_url', image_url: { url: imageDataUrl } },
    ],
  };
}

// =============================================================================
// Response parsing
// =============================================================================

export function extractAssistantContent(completion) {
  const content = completion?.choices?.[0]?.message?.content;

  if (typeof content !== 'string') {
    throw new GroqServiceError('Unexpected response format from Groq API.', {
      code: GroqErrorCode.PARSE_ERROR,
    });
  }

  return content;
}

export function parseDiseaseAnalysis(rawContent) {
  if (typeof rawContent !== 'string') {
    throw new GroqServiceError('Raw content must be a string.', {
      code: GroqErrorCode.PARSE_ERROR,
    });
  }

  let cleanContent = rawContent.trim();
  if (cleanContent.startsWith('```json')) {
    cleanContent = cleanContent.slice(7);
  } else if (cleanContent.startsWith('```')) {
    cleanContent = cleanContent.slice(3);
  }
  if (cleanContent.endsWith('```')) {
    cleanContent = cleanContent.slice(0, -3);
  }
  cleanContent = cleanContent.trim();

  try {
    const parsed = JSON.parse(cleanContent);
    return parsed;
  } catch (error) {
    throw new GroqServiceError(`Failed to parse AI response as JSON: ${error.message}`, {
      code: GroqErrorCode.PARSE_ERROR,
      cause: error,
    });
  }
}

// =============================================================================
// Public API — crop analysis
// =============================================================================

/**
 * Sends a crop image to Groq for disease identification.
 * Returns a structured diagnosis JSON.
 *
 * @param {File|string} imageInput - Crop image File or base64 data URL
 * @returns {Promise<Object>} Core identification result
 */
export async function analyzeCropImage(imageInput) {
  if (!imageInput) {
    throw new GroqServiceError('A crop image is required for analysis.', {
      code: GroqErrorCode.INVALID_INPUT,
    });
  }

  const imageDataUrl =
    imageInput instanceof File
      ? await fileToBase64DataUrl(imageInput)
      : imageInput;

  const apiKey = getGroqApiKey();

  // If no client-side API key is available, use the secure backend proxy endpoint
  if (!apiKey) {
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: imageDataUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server returned status ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw new GroqServiceError(
        `Failed to analyze crop image via secure API proxy: ${error.message}`,
        { code: GroqErrorCode.REQUEST_FAILED, cause: error }
      );
    }
  }

  // Fallback: If client-side API key is configured (local dev), run request client-side
  const systemMessage = {
    role: 'system',
    content: `You are CropMedic AI, an expert agricultural vision assistant.
Your task is to analyze the provided image of a crop, plant, or leaf.

First, determine if the image actually contains a crop, plant, or leaf.
If the image does NOT contain a crop, plant, or leaf, you must return:
{
  "isCrop": false,
  "message": "Please upload a clear image of a crop or plant."
}

If the image DOES contain a crop, plant, or leaf, analyze it and identify:
1. The name of the crop (e.g. Tomato, Potato, Wheat, Cotton, Onion, Sugarcane, Chili, Maize, Rice).
2. The specific disease or condition identified (or "None" if healthy).
3. Your confidence score as an integer percentage between 0 and 100 (e.g. 95).
4. The severity of the condition ("Low", "Moderate", or "High"). For healthy crops, return "Low".
5. A brief description of the condition.
6. A list of visible symptoms seen in the image.
7. A list of likely causes of this condition.
8. A list of recommended immediate actions for the farmer.
9. A short summary of the analysis.

You must respond ONLY with a valid JSON object matching this schema:
{
  "crop": "Name of the crop",
  "disease": "Name of the disease (or 'None' if healthy)",
  "confidence": 95,
  "severity": "Low | Moderate | High",
  "description": "Detailed description of the plant leaf condition",
  "visibleSymptoms": ["symptom 1", "symptom 2"],
  "likelyCauses": ["cause 1", "cause 2"],
  "recommendedActions": ["action 1", "action 2"],
  "analysisSummary": "Summary of analysis."
}

Do not include any introductory or concluding text. Do not wrap the JSON in markdown code blocks. Return only raw JSON.`
  };

  const userMessage = buildVisionMessage(
    "Identify the crop and disease in this image and output the results as a JSON object.",
    imageDataUrl
  );

  const completion = await createChatCompletion([systemMessage, userMessage], {
    temperature: 0.1,
    maxTokens: 512,
    responseFormat: { type: 'json_object' }
  });

  const rawContent = extractAssistantContent(completion);
  return parseDiseaseAnalysis(rawContent);
}

// =============================================================================
// Chatbot
// =============================================================================

export async function generateChatResponse(messageHistory, contextData) {
  const { fieldProfile, weatherData } = contextData || {};

  const systemPrompt = `You are a highly intelligent, empathetic agricultural expert assistant.
You must prioritize local context: District: ${fieldProfile?.district || 'Unknown'}, Crop: ${fieldProfile?.cropType || 'Unknown'}.
Weather Context: ${JSON.stringify(weatherData || {})}`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...messageHistory.map(msg => ({
      role: msg.role,
      content: msg.content
    }))
  ];

  const apiKey = getGroqApiKey();
  
  if (apiKey) {
    const completion = await createChatCompletion(messages, {
      model: 'openai/gpt-oss-120b',
      temperature: 0.5,
      maxTokens: 512,
    });
    return extractAssistantContent(completion);
  }

  // Fallback
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages })
    });
    const data = await response.json();
    return data.reply || data.content; // fallback extraction based on expected proxy response
  } catch (error) {
    throw new GroqServiceError(
      `Failed to generate chat response: ${error.message}`,
      { code: GroqErrorCode.REQUEST_FAILED, cause: error }
    );
  }
}

// =============================================================================
// Localized Tips
// =============================================================================

export async function getLocalCropAdvice(cropName, district) {
  const messages = [
    {
      role: 'system',
      content: `You are an expert agronomist. Provide a very short (2-3 sentences), highly localized tip about growing ${cropName} specifically in the ${district} district of Pakistan. Keep it extremely simple, friendly, no markdown.`
    },
    {
      role: 'user',
      content: `Give me a local tip for ${cropName} in ${district}.`
    }
  ];
  
  const apiKey = getGroqApiKey();
  if (apiKey) {
    try {
      const completion = await createChatCompletion(messages, {
        model: 'openai/gpt-oss-120b',
        temperature: 0.3,
        maxTokens: 150
      });
      return extractAssistantContent(completion);
    } catch (e) {
      return `For best results in ${district}, always consult your local agriculture extension office regarding specific sowing dates for ${cropName}.`;
    }
  }
  return `For best results in ${district}, always consult your local agriculture extension office regarding specific sowing dates for ${cropName}.`;
}
