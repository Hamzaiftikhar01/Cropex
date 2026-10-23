/**
 * Vercel Serverless Function: Secure Groq Farm Advisor Rephraser
 * --------------------------------------------------------------
 * - Enforces per-IP rate limiting
 * - Uses server-side GROQ_API_KEY only
 * - Rephrases deterministic advisor outputs into warm, natural language
 */

import { checkRateLimit, getClientIp } from './_rateLimit.js';

const GROQ_MODEL = 'openai/gpt-oss-120b';
const RATE_LIMIT_MAX = 30;
const RATE_LIMIT_WINDOW_MS = 60_000;

function setCors(res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With');
}

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  // ── Rate limiting ────────────────────────────────────────────────────────────
  const ip = getClientIp(req);
  const rl = checkRateLimit(ip, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS);
  res.setHeader('X-RateLimit-Limit', RATE_LIMIT_MAX);
  res.setHeader('X-RateLimit-Remaining', rl.remaining);

  if (!rl.allowed) {
    return res.status(429).json({ error: 'Too many requests. Please wait a minute.' });
  }

  // ── Input validation ─────────────────────────────────────────────────────────
  const { priority, headline, reasoning, language } = req.body || {};

  if (!headline || typeof headline !== 'string') {
    return res.status(400).json({ error: 'Missing advisor headline payload.' });
  }
  if (!reasoning || typeof reasoning !== 'string') {
    return res.status(400).json({ error: 'Missing advisor reasoning payload.' });
  }

  // Sanity cap to prevent prompt injection via huge payloads
  if (headline.length > 500 || reasoning.length > 1000) {
    return res.status(400).json({ error: 'Payload too large.' });
  }

  // ── API key ──────────────────────────────────────────────────────────────────
  const apiKey = process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Server configuration error.' });
  }

  // ── Language config ──────────────────────────────────────────────────────────
  let targetLang = 'English';
  let scriptInstructions = '';
  if (language === 'ur') {
    targetLang = 'Urdu';
    scriptInstructions = 'Write in standard Urdu Script (Nastaliq). Keep all numbers and units as Western digits (e.g. 18°C, 92%, 4 days).';
  } else if (language === 'pa') {
    targetLang = 'Punjabi (Shahmukhi)';
    scriptInstructions = 'Write in Shahmukhi Script (Perso-Arabic used in Pakistani Punjab). Keep all numbers as Western digits. Do NOT use Gurmukhi.';
  }

  // ── Groq request ─────────────────────────────────────────────────────────────
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20_000);

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
          messages: [
            {
              role: 'system',
              content: `You are the Cropex AI Farm Advisor — a warm, helpful agricultural expert in Pakistan who speaks directly and respectfully to local farmers.
Your job: rephrase raw, deterministic farm alerts into encouraging, natural messages.
Language: ${targetLang}. ${scriptInstructions}
Respond ONLY with valid JSON:
{ "headline": "...", "reasoning": "..." }
No markdown, no code fences, raw JSON only.`,
            },
            {
              role: 'user',
              content: `Priority: ${priority || 'unknown'}\nHeadline: "${headline}"\nReasoning: "${reasoning}"\nLanguage: ${targetLang}`,
            },
          ],
          temperature: 0.3,
          max_tokens: 256,
          response_format: { type: 'json_object' },
        }),
      });
    } finally {
      clearTimeout(timeout);
    }

    if (!groqRes.ok) {
      const errText = await groqRes.text().catch(() => groqRes.statusText);
      console.error('[rephrase] Groq error:', groqRes.status, errText);
      return res.status(502).json({ error: 'AI service error. Showing default advice.' });
    }

    const data = await groqRes.json();
    let rawContent = data?.choices?.[0]?.message?.content;
    if (typeof rawContent !== 'string') {
      return res.status(500).json({ error: 'Unexpected AI response format.' });
    }

    rawContent = rawContent.trim().replace(/^```[a-z]*\n?/, '').replace(/```$/, '').trim();
    const parsed = JSON.parse(rawContent);
    return res.status(200).json(parsed);

  } catch (err) {
    if (err.name === 'AbortError') {
      return res.status(504).json({ error: 'Advisor timed out. Showing default advice.' });
    }
    console.error('[rephrase] Error:', err);
    return res.status(500).json({ error: 'Internal error. Showing default advice.' });
  }
}
