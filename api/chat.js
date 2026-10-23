/**
 * Vercel Serverless Function: Secure Groq Chat Proxy
 * ---------------------------------------------------
 * - Handles chatbot messages from the frontend
 * - Rate-limited, input-validated
 * - Uses server-side GROQ_API_KEY only
 */

import { checkRateLimit, getClientIp } from './_rateLimit.js';

const GROQ_MODEL = 'openai/gpt-oss-120b';
const RATE_LIMIT_MAX = 40;
const RATE_LIMIT_WINDOW_MS = 60_000;
const MAX_MESSAGES = 20;
const MAX_MESSAGE_LENGTH = 2000;

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
  const { messages, ragContext, sources } = req.body || {};

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Missing messages array.' });
  }

  if (messages.length > MAX_MESSAGES) {
    return res.status(400).json({ error: `Too many messages (max ${MAX_MESSAGES}).` });
  }

  // Validate each message shape and cap content length
  const sanitizedMessages = messages.map((msg) => {
    if (!msg || typeof msg.role !== 'string' || typeof msg.content !== 'string') {
      return null;
    }
    return {
      role: ['system', 'user', 'assistant'].includes(msg.role) ? msg.role : 'user',
      content: msg.content.slice(0, MAX_MESSAGE_LENGTH),
    };
  }).filter(Boolean);

  if (sanitizedMessages.length === 0) {
    return res.status(400).json({ error: 'No valid messages provided.' });
  }

  // Inject RAG grounding instructions and sources into system prompt
  if (ragContext && typeof ragContext === 'string') {
    const ragSystemPrompt = `\n\n=== VERIFIED LOCAL RESEARCH SOURCES (PAKISTAN) ===\n${ragContext}\n==================================================\n\nSTRICT INSTRUCTIONS FOR RAG FAITHFULNESS:\n1. Base disease treatments, product recommendations, and crop advice ONLY on the verified sources above.\n2. Cite your sources clearly in your response (e.g. "[Source: NARC Wheat Program]" or "[Source: DPP Pakistan]").\n3. NEVER invent or extrapolate chemical dosages. Only quote dosages present in the sources; otherwise advise consulting the product label.\n4. If the sources above do not contain the answer, explicitly inform the farmer and advise contacting their district agricultural extension officer or calling the NARC helpline (051-9255000).\n5. Keep advice concise, practical, and farmer-friendly. Respond in Urdu or English according to the farmer's language.`;

    const systemIdx = sanitizedMessages.findIndex((m) => m.role === 'system');
    if (systemIdx >= 0) {
      sanitizedMessages[systemIdx].content += ragSystemPrompt;
    } else {
      sanitizedMessages.unshift({
        role: 'system',
        content: `You are Cropex AI, an expert precision farming advisor for Pakistan.${ragSystemPrompt}`,
      });
    }
  }

  // ── API key ──────────────────────────────────────────────────────────────────
  const apiKey = process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Server configuration error.' });
  }

  // ── Groq request ─────────────────────────────────────────────────────────────
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30_000);

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
          messages: sanitizedMessages,
          temperature: 0.5,
          max_tokens: 1024,
        }),
      });
    } finally {
      clearTimeout(timeout);
    }

    if (!groqRes.ok) {
      const errText = await groqRes.text().catch(() => groqRes.statusText);
      console.error('[chat] Groq error:', groqRes.status, errText);
      return res.status(502).json({ error: 'AI service error. Please try again.' });
    }

    const data = await groqRes.json();
    const reply = data?.choices?.[0]?.message?.content;

    if (typeof reply !== 'string') {
      return res.status(500).json({ error: 'Unexpected AI response.' });
    }

    return res.status(200).json({ reply, sources: Array.isArray(sources) ? sources : [] });

  } catch (err) {
    if (err.name === 'AbortError') {
      return res.status(504).json({ error: 'Chat timed out. Please try again.' });
    }
    console.error('[chat] Error:', err);
    return res.status(500).json({ error: 'Internal error. Please try again.' });
  }
}
