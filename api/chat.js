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

function isConversationalGreeting(text) {
  if (!text || typeof text !== 'string') return true;
  // Remove Arabic/Urdu diacritics (tashkeel, shadda, etc.)
  const strippedDiacritics = text.replace(/[\u064B-\u065F\u0670]/g, '');
  const cleaned = strippedDiacritics.trim().toLowerCase().replace(/[^\w\s\u0600-\u06FF]/gi, ' ');
  const words = cleaned.split(/\s+/).filter(Boolean);
  if (words.length === 0) return true;

  const greetings = new Set([
    'hi', 'hello', 'hey', 'heya', 'heyy', 'howdy', 'sup', 'yo',
    'salam', 'asalam', 'assalam', 'slam', 'aoa',
    'thanks', 'thank', 'thx', 'ty', 'shukriya', 'meherbani', 'jazakallah',
    'bye', 'goodbye', 'cya',
    'ok', 'okay', 'k', 'cool', 'great', 'fine', 'alright', 'nice', 'yes', 'no', 'yep', 'nope',
    'test', 'testing',
    'سلام', 'ہیلو', 'ہائے', 'شکریہ', 'مہربانی', 'ٹھیک', 'اچھا', 'حافظ', 'اللہ', 'الله', 'خدا'
  ]);

  if (words.length <= 2 && words.every((w) => greetings.has(w))) {
    return true;
  }

  const normalized = cleaned.replace(/\s+/g, ' ');
  const phrases = [
    'good morning', 'good afternoon', 'good evening', 'good day', 'good night',
    'how are you', 'how r u', 'how are u', 'how is it going', 'whats up', 'what is up',
    'who are you', 'what is your name', 'what can you do', 'who made you',
    'assalam o alaikum', 'assalam o alaykum', 'asalam o alaikum', 'assalamu alaikum',
    'kya hal hai', 'kya haal hai', 'kia hal hai', 'kaise ho', 'kese ho', 'kaisy ho',
    'tum kon ho', 'aap kon hain', 'ap kon ho',
    'allah hafiz', 'khuda hafiz', 'rab rakha',
    'theek hai', 'thik hai', 'sahi hai',
    'السلام علیکم', 'وعلیکم السلام', 'کیا حال ہے', 'کیسے ہو', 'آپ کون ہیں', 'اللہ حافظ', 'الله حافظ', 'خدا حافظ'
  ];

  if (phrases.some((p) => normalized === p || normalized.startsWith(p + ' '))) {
    return true;
  }

  if (words.length <= 3) {
    const agriTerms = [
      'crop', 'wheat', 'rice', 'cotton', 'sugarcane', 'maize', 'corn', 'tomato', 'potato', 'chili', 'onion',
      'rust', 'blight', 'blast', 'rot', 'smut', 'mildew', 'curl', 'spray', 'pesticide', 'fungicide',
      'insecticide', 'fertilizer', 'urea', 'dap', 'disease', 'pest', 'leaf', 'seed', 'yield', 'water', 'irrigation',
      'گندم', 'چاول', 'کپاس', 'گنا', 'مکئی', 'ٹماٹر', 'آلو', 'مرچ', 'پیاز', 'بیماری', 'سپرے', 'کھاد', 'پانی'
    ];
    const hasAgriTerm = words.some((w) => agriTerms.some((t) => w.includes(t)));
    if (!hasAgriTerm && words.some((w) => greetings.has(w))) return true;
  }

  return false;
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
  const { messages, ragContext, sources, liveContextPrompt, isGreeting: isGreetingFlag } = req.body || {};

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

  // Detect if the latest inquiry is a greeting/casual pleasantry
  const lastUserMsg = [...sanitizedMessages].reverse().find((m) => m.role === 'user')?.content || '';
  const isGreeting = Boolean(isGreetingFlag) || isConversationalGreeting(lastUserMsg);

  // Inject live website context & telemetry into system prompt so AI can directly answer questions about current farm & scans
  if (liveContextPrompt && typeof liveContextPrompt === 'string') {
    const liveSystemPrompt = `\n\n=== LIVE FARM TELEMETRY & WEBSITE STATE (CURRENT USER SESSION) ===\n${liveContextPrompt}\n===================================================================\n\nREAL-TIME WEBSITE CONTEXT GROUNDING DIRECTIVES:\n1. The data above is live telemetry from the user's active session on the Cropex website right now.\n2. When the user asks about their farm, their field, their crops, recent scans, detected diseases, symptoms, weather, spraying, or what is happening on their field:\n   - Directly read, summarize, and explain the live data from above (e.g., specific disease diagnosed, active DPP product names with exact label doses, weather conditions, spray window safety, and irrigation status).\n   - Example in Urdu: "آپ کے حالیہ اسکین کے مطابق آپ کی فصل میں [Disease] تشخیص ہوئی ہے جس کا علاج [Product] ہے..."\n   - Example in English: "According to your live scan on Cropex, your [Crop] has been diagnosed with [Disease]..."\n3. Always adhere to official DPP-registered remedies and label dosages.\n4. Respond in natural, fluent Urdu (or Punjabi) or English matching the user's language.`;

    const systemIdx = sanitizedMessages.findIndex((m) => m.role === 'system');
    if (systemIdx >= 0) {
      sanitizedMessages[systemIdx].content += liveSystemPrompt;
    } else {
      sanitizedMessages.unshift({
        role: 'system',
        content: `You are Boota (بوٹا), an expert precision farming advisor for Pakistan. When asked your name or who you are, state that your name is Boota (بوٹا).${liveSystemPrompt}`,
      });
    }
  }

  // Inject RAG grounding instructions and sources into system prompt ONLY for substantive queries
  if (!isGreeting && ragContext && typeof ragContext === 'string' && Array.isArray(sources) && sources.length > 0) {
    const ragSystemPrompt = `\n\n=== VERIFIED LOCAL RESEARCH SOURCES (PAKISTAN) ===\n${ragContext}\n==================================================\n\nSTRICT INSTRUCTIONS FOR RAG FAITHFULNESS:\n1. Base disease treatments, product recommendations, and crop advice ONLY on the verified sources above.\n2. Cite your sources clearly in your response (e.g. "[Source: NARC Wheat Program]" or "[Source: DPP Pakistan]").\n3. NEVER invent or extrapolate chemical dosages. Only quote dosages present in the sources; otherwise advise consulting the product label.\n4. If the sources above do not contain the answer, explicitly inform the farmer and advise contacting their district agricultural extension officer or calling the NARC helpline (051-9255000).\n5. Keep advice concise, practical, and farmer-friendly. Respond in Urdu or English according to the farmer's language.`;

    const systemIdx = sanitizedMessages.findIndex((m) => m.role === 'system');
    if (systemIdx >= 0) {
      sanitizedMessages[systemIdx].content += ragSystemPrompt;
    } else {
      sanitizedMessages.unshift({
        role: 'system',
        content: `You are Boota (بوٹا), an expert precision farming advisor for Pakistan. When asked your name or who you are, state that your name is Boota (بوٹا).${ragSystemPrompt}`,
      });
    }
  } else if (isGreeting) {
    const greetingSystemPrompt = `\n\nCONVERSATIONAL GREETING INSTRUCTIONS:\nThe user has sent a friendly greeting, pleasantry, or casual hello. Respond warmly, politely, and helpfully in their language (Urdu or English), introduce yourself as Boota (بوٹا) — the Cropex AI Farm Advisor, and ask how you can help with their crops, diseases, irrigation, or weather today. DO NOT attach or invent scientific citations or sources for simple greetings.`;
    const systemIdx = sanitizedMessages.findIndex((m) => m.role === 'system');
    if (systemIdx >= 0) {
      sanitizedMessages[systemIdx].content += greetingSystemPrompt;
    } else {
      sanitizedMessages.unshift({
        role: 'system',
        content: `You are Boota (بوٹا), an expert precision farming advisor for Pakistan. When asked your name or who you are, state that your name is Boota (بوٹا).${greetingSystemPrompt}`,
      });
    }
  }

  // Ensure persona is always present
  if (!sanitizedMessages.some((m) => m.role === 'system')) {
    sanitizedMessages.unshift({
      role: 'system',
      content: 'You are Boota (بوٹا), an expert precision farming advisor for Pakistan. When asked your name or who you are, state that your name is Boota (بوٹا).',
    });
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

    return res.status(200).json({
      reply,
      sources: isGreeting ? [] : (Array.isArray(sources) ? sources : []),
    });

  } catch (err) {
    if (err.name === 'AbortError') {
      return res.status(504).json({ error: 'Chat timed out. Please try again.' });
    }
    console.error('[chat] Error:', err);
    return res.status(500).json({ error: 'Internal error. Please try again.' });
  }
}
