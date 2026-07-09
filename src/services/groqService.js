/**
 * Groq API Service
 * ----------------
 * Reusable client for CropCare AI's Groq-powered crop disease analysis.
 * Uses the OpenAI-compatible Chat Completions API.
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
// Structured analysis schema (target shape for future integration)
// =============================================================================

/**
 * Expected structure returned by getStructuredDiseaseAnalysis().
 * @typedef {Object} DiseaseAnalysisResult
 * @property {string} cropName      - Identified crop name
 * @property {string} disease       - Detected disease or "Healthy" if none found
 * @property {number} confidence    - Confidence score from 0 to 100
 * @property {string} causes        - Likely causes of the disease
 * @property {string} treatment     - Recommended treatment steps
 * @property {string} prevention    - Prevention strategies
 */

/** Empty template matching DiseaseAnalysisResult — used when building responses */
export const EMPTY_DISEASE_ANALYSIS = Object.freeze({
  cropName: '',
  disease: '',
  confidence: 0,
  causes: '',
  treatment: '',
  prevention: '',
});

// =============================================================================
// Custom error handling
// =============================================================================

/**
 * Application-level error for all Groq service failures.
 * Wraps HTTP, configuration, validation, and parsing errors.
 */
export class GroqServiceError extends Error {
  /**
   * @param {string} message  - Human-readable error message
   * @param {Object} [options]
   * @param {string} [options.code]     - Machine-readable error code
   * @param {number} [options.status]   - HTTP status code (if applicable)
   * @param {unknown} [options.cause]   - Original underlying error
   */
  constructor(message, { code = 'GROQ_ERROR', status = null, cause = null } = {}) {
    super(message);
    this.name = 'GroqServiceError';
    this.code = code;
    this.status = status;
    this.cause = cause;
  }
}

/** Error codes used across the service */
export const GroqErrorCode = Object.freeze({
  MISSING_API_KEY: 'MISSING_API_KEY',
  INVALID_INPUT: 'INVALID_INPUT',
  REQUEST_FAILED: 'REQUEST_FAILED',
  TIMEOUT: 'TIMEOUT',
  PARSE_ERROR: 'PARSE_ERROR',
  NOT_IMPLEMENTED: 'NOT_IMPLEMENTED',
});

/**
 * Parses a failed Groq API response into a GroqServiceError.
 *
 * @param {Response} response
 * @returns {Promise<GroqServiceError>}
 */
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

/**
 * Reads the Groq API key from the Vite environment.
 * Never hardcode keys — always use import.meta.env.VITE_GROQ_API_KEY.
 *
 * @returns {string|null}
 */
export function getGroqApiKey() {
  const key = import.meta.env.VITE_GROQ_API_KEY;
  return typeof key === 'string' && key.trim().length > 0 ? key.trim() : null;
}

/**
 * Checks whether the Groq API key is configured in the environment.
 *
 * @returns {boolean}
 */
export function isGroqConfigured() {
  return getGroqApiKey() !== null;
}

/**
 * Ensures the API key is present; throws GroqServiceError if missing.
 * @private
 */
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

/**
 * Sends an authenticated request to the Groq API.
 * Handles timeouts, non-OK responses, and network failures.
 *
 * @param {string} path            - API path (e.g. "/chat/completions")
 * @param {RequestInit} options    - Fetch options (method, body, etc.)
 * @returns {Promise<unknown>}     - Parsed JSON response body
 */
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

/**
 * Calls the Groq chat completions endpoint.
 * This is the core method future analysis functions will build upon.
 *
 * @param {Array<Object>} messages  - OpenAI-format message array
 * @param {Object} [options]
 * @param {number} [options.temperature]  - Sampling temperature (0–2)
 * @param {number} [options.maxTokens]  - Maximum tokens in the response
 * @returns {Promise<Object>} Groq chat completion response
 */
export async function createChatCompletion(messages, { temperature = 0.2, maxTokens = 1024 } = {}) {
  if (!Array.isArray(messages) || messages.length === 0) {
    throw new GroqServiceError('Messages array is required and must not be empty.', {
      code: GroqErrorCode.INVALID_INPUT,
    });
  }

  return groqRequest(CHAT_COMPLETIONS_PATH, {
    method: 'POST',
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages,
      temperature,
      max_tokens: maxTokens,
    }),
  });
}

// =============================================================================
// Image helpers (preparation for vision-based crop analysis)
// =============================================================================

/**
 * Converts a File object to a base64 data URL string.
 * Used internally when preparing image payloads for the vision model.
 *
 * @param {File} file - Image file (JPEG, PNG, or WEBP)
 * @returns {Promise<string>} Base64-encoded data URL
 */
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

/**
 * Builds an OpenAI-compatible vision message containing a text prompt and image.
 *
 * @param {string} prompt          - Instruction text for the model
 * @param {string} imageDataUrl    - Base64 data URL of the crop image
 * @returns {Object} Message object ready for createChatCompletion()
 */
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
// Response parsing (placeholder for structured JSON extraction)
// =============================================================================

/**
 * Extracts the assistant's text content from a Groq chat completion response.
 *
 * @param {Object} completion - Raw response from createChatCompletion()
 * @returns {string}
 */
export function extractAssistantContent(completion) {
  const content = completion?.choices?.[0]?.message?.content;

  if (typeof content !== 'string') {
    throw new GroqServiceError('Unexpected response format from Groq API.', {
      code: GroqErrorCode.PARSE_ERROR,
    });
  }

  return content;
}

/**
 * Parses raw model output into a DiseaseAnalysisResult object.
 * Implementation will be added when analysis prompts are finalized.
 *
 * @param {string} rawContent - Raw text/JSON string from the model
 * @returns {DiseaseAnalysisResult}
 */
export function parseDiseaseAnalysis(rawContent) {
  // Future: parse JSON response from the model into structured fields
  void rawContent;

  throw new GroqServiceError(
    'Disease analysis parsing is not yet implemented.',
    { code: GroqErrorCode.NOT_IMPLEMENTED },
  );
}

// =============================================================================
// Public API — crop analysis (ready for future UI integration)
// =============================================================================

/**
 * Sends a crop image to Groq for disease analysis.
 *
 * Accepts either a File object or a pre-encoded base64 data URL.
 * Full prompt engineering and response handling will be added in a later step.
 *
 * @param {File|string} imageInput - Crop image File or base64 data URL
 * @returns {Promise<DiseaseAnalysisResult>} Structured disease analysis
 */
export async function analyzeCropImage(imageInput) {
  requireApiKey();

  if (!imageInput) {
    throw new GroqServiceError('A crop image is required for analysis.', {
      code: GroqErrorCode.INVALID_INPUT,
    });
  }

  // Resolve image to a base64 data URL regardless of input type
  const imageDataUrl =
    imageInput instanceof File
      ? await fileToBase64DataUrl(imageInput)
      : imageInput;

  // Future integration steps:
  // 1. Build the analysis prompt
  // 2. const message = buildVisionMessage(prompt, imageDataUrl)
  // 3. const completion = await createChatCompletion([message])
  // 4. const raw = extractAssistantContent(completion)
  // 5. return parseDiseaseAnalysis(raw)

  void imageDataUrl;

  throw new GroqServiceError(
    'Crop image analysis is not yet implemented. Service structure is ready for integration.',
    { code: GroqErrorCode.NOT_IMPLEMENTED },
  );
}

/**
 * Returns a structured disease analysis for a given crop image.
 * Convenience wrapper around analyzeCropImage with explicit return typing.
 *
 * @param {File|string} imageInput - Crop image File or base64 data URL
 * @returns {Promise<DiseaseAnalysisResult>}
 */
export async function getStructuredDiseaseAnalysis(imageInput) {
  return analyzeCropImage(imageInput);
}
