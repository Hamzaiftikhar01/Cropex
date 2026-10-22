/**
 * Vercel Serverless Function: Secure Groq Vision Proxy
 * -----------------------------------------------------
 * - Accepts a base64 image from the frontend
 * - Validates file type, size, and content
 * - Enforces per-IP rate limiting (20 req / min)
 * - Calls Groq using the secure GROQ_API_KEY server env var (never VITE_*)
 * - Returns structured crop disease diagnosis JSON
 */

import { checkRateLimit, getClientIp } from './_rateLimit.js';

// Constants
const GROQ_MODEL = 'qwen/qwen3.8-27b';
const MAX_IMAGE_BYTES = 4 * 1024 * 1024; // 4 MB after compression
const ALLOWED_MIME_PREFIXES = ['data:image/jpeg', 'data:image/png', 'data:image/webp'];
const RATE_LIMIT_MAX = 20;
const RATE_LIMIT_WINDOW_MS = 60_000;

// CORS helper – restrict in prod to your actual domain
function setCors(res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, X-Requested-With'
  );
}

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  // ── Rate limiting ───────────────────────────────────────────────────────────
  const ip = getClientIp(req);
  const rl = checkRateLimit(ip, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS);
  res.setHeader('X-RateLimit-Limit', RATE_LIMIT_MAX);
  res.setHeader('X-RateLimit-Remaining', rl.remaining);
  res.setHeader('X-RateLimit-Reset', Math.ceil(rl.resetAt / 1000));

  if (!rl.allowed) {
    return res.status(429).json({
      error: 'Too many requests. Please wait a minute and try again.',
      retryAfterMs: rl.resetAt - Date.now(),
    });
  }

  // ── Input validation ────────────────────────────────────────────────────────
  const { image } = req.body || {};

  if (!image || typeof image !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid image payload.' });
  }

  const hasSupportedType = ALLOWED_MIME_PREFIXES.some((prefix) => image.startsWith(prefix));
  if (!hasSupportedType) {
    return res.status(400).json({
      error: 'Unsupported image type. Please upload a JPG, PNG, or WebP file.',
    });
  }

  // Rough byte size check on the base64 string (~0.75x actual bytes)
  const estimatedBytes = Math.ceil((image.length * 3) / 4);
  if (estimatedBytes > MAX_IMAGE_BYTES) {
    return res.status(413).json({
      error: `Image is too large (${Math.round(estimatedBytes / 1024)}KB). Max allowed is 4MB. Please compress your image and try again.`,
    });
  }

  // ── API key ─────────────────────────────────────────────────────────────────
  const apiKey = process.env.GROQ_API_KEY; // Never use VITE_* on the server
  if (!apiKey) {
    return res.status(500).json({
      error: 'Server is missing GROQ_API_KEY. Contact the administrator.',
    });
  }

  // ── Groq request ────────────────────────────────────────────────────────────
  try {
    const systemMessage = {
      role: 'system',
      content: `You are Cropex AI, an expert agricultural vision assistant for Pakistani farmers.

IMPORTANT DISCLAIMER: This is an AI-assisted tool. Diagnoses are indicative only and must be verified by a qualified agronomist before any treatment is applied.

Your task is to analyze the provided image of a crop, plant, or leaf.

First, determine if the image actually contains a crop, plant, or leaf.
If the image does NOT contain a crop, plant, or leaf, return:
{ "isCrop": false, "message": "Please upload a clear image of a crop or plant leaf." }

If the image DOES contain a crop or leaf, analyze it and identify:
1. Crop name (e.g. Wheat, Rice, Cotton, Sugarcane, Maize, Tomato, Potato, Onion, Chili)
2. Disease or condition (or "None" if healthy)
3. Confidence score as integer 0–100
4. Severity: "Low", "Moderate", or "High" (healthy = "Low")
5. Brief description
6. Visible symptoms (list)
7. Likely causes (list)
8. Recommended actions — ONLY suggest treatments registered in Pakistan. Do NOT invent dosages; say "consult label or extension officer" for specific amounts.
9. Short analysis summary

Respond ONLY with a valid JSON object:
{
  "isCrop": true,
  "crop": "Crop name",
  "disease": "Disease name or 'None'",
  "confidence": 85,
  "severity": "Low | Moderate | High",
  "description": "...",
  "visibleSymptoms": ["..."],
  "likelyCauses": ["..."],
  "recommendedActions": ["..."],
  "analysisSummary": "...",
  "disclaimer": "AI diagnosis only. Verify with a certified agronomist before applying any treatment."
}

No markdown, no code blocks, raw JSON only.`,
    };

    const userMessage = {
      role: 'user',
      content: [
        { type: 'text', text: 'Identify the crop and any disease in this image. Output results as JSON.' },
        { type: 'image_url', image_url: { url: image } },
      ],
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 55_000);

    let groqRes;
    try {
      groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages: [systemMessage, userMessage],
          temperature: 0.1,
          max_tokens: 600,
          response_format: { type: 'json_object' },
        }),
      });
    } finally {
      clearTimeout(timeout);
    }

    if (!groqRes.ok) {
      const errText = await groqRes.text().catch(() => groqRes.statusText);
      console.error('[analyze] Groq error:', groqRes.status, errText);
      return res.status(502).json({
        error: `AI service error (${groqRes.status}). Please try again shortly.`,
      });
    }

    const data = await groqRes.json();
    let rawContent = data?.choices?.[0]?.message?.content;

    if (typeof rawContent !== 'string') {
      return res.status(500).json({ error: 'Unexpected response from AI service.' });
    }

    // Strip markdown code fences if model ignores the instruction
    rawContent = rawContent.trim();
    if (rawContent.startsWith('```')) {
      rawContent = rawContent.replace(/^```[a-z]*\n?/, '').replace(/```$/, '').trim();
    }

    const parsed = JSON.parse(rawContent);
    return res.status(200).json(parsed);

  } catch (err) {
    if (err.name === 'AbortError') {
      return res.status(504).json({ error: 'AI service timed out. Please try again.' });
    }
    console.error('[analyze] Unhandled error:', err);
    return res.status(500).json({ error: 'Internal server error. Please try again.' });
  }
}
