/**
 * Vercel Serverless Function: Agricultural Knowledge Base RAG Search API
 * ----------------------------------------------------------------------
 * - Provides grounded agricultural information from Pakistani research and DPP registrations
 * - Returns ranked chunks with source citations and safety advice
 * - Rate-limited and input-validated
 */

import { checkRateLimit, getClientIp } from './_rateLimit.js';
import { searchKnowledgeBase, formatRagContextForPrompt } from '../src/lib/ragSearch.js';

const RATE_LIMIT_MAX = 60;
const RATE_LIMIT_WINDOW_MS = 60_000;
const MAX_QUERY_LENGTH = 500;

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
    return res.status(429).json({ error: 'Too many search requests. Please wait a minute.' });
  }

  // ── Input validation ─────────────────────────────────────────────────────────
  const { query, cropId, diseaseId, category, limit = 5 } = req.body || {};

  if (!query && !cropId && !diseaseId) {
    return res.status(400).json({ error: 'Query, cropId, or diseaseId must be provided.' });
  }

  const safeQuery = typeof query === 'string' ? query.slice(0, MAX_QUERY_LENGTH) : '';
  const safeCropId = typeof cropId === 'string' ? cropId.slice(0, 50) : null;
  const safeDiseaseId = typeof diseaseId === 'string' ? diseaseId.slice(0, 80) : null;
  const safeCategory = typeof category === 'string' ? category.slice(0, 50) : null;
  const safeLimit = Math.min(Math.max(1, Number(limit) || 5), 10);

  try {
    const searchResult = searchKnowledgeBase(safeQuery, {
      cropId: safeCropId,
      diseaseId: safeDiseaseId,
      category: safeCategory,
      limit: safeLimit,
    });

    const formattedContext = formatRagContextForPrompt(searchResult.results);

    return res.status(200).json({
      success: true,
      query: safeQuery,
      totalFound: searchResult.totalFound,
      results: searchResult.results,
      fallbackAdvice: searchResult.fallbackAdvice,
      formattedContext,
    });
  } catch (err) {
    console.error('[rag] Search error:', err);
    return res.status(500).json({ error: 'Failed to search knowledge base.' });
  }
}
