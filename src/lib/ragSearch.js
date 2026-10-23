/**
 * Cropex Phase 3 — Client/Server Hybrid RAG Search Engine
 * ========================================================
 * High-performance, zero-dependency search engine designed for Pakistani agricultural queries.
 *
 * Capabilities:
 *  - BM25-inspired term frequency & inverse document frequency (TF-IDF) scoring
 *  - Field-weighted boosts (tags > title > content)
 *  - Crop & Disease contextual filtering and boosting
 *  - Bilingual keyword support (English + Urdu transliteration / script)
 *  - Graceful fallback when confidence is low ("consult an extension officer")
 *  - Fully functional in both Node.js (Vercel serverless) and browser (Vite)
 */

import { KNOWLEDGE_CHUNKS } from './knowledgeBase.js';

// Common English stopwords to ignore in search weighting
const STOPWORDS_EN = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'he',
  'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the', 'to', 'was', 'were',
  'will', 'with', 'what', 'how', 'when', 'where', 'why', 'can', 'should',
  'my', 'i', 'we', 'our', 'do', 'does', 'did', 'this', 'these', 'those',
  'field', 'fields', 'crop', 'crops', 'plant', 'plants',
  'hi', 'hello', 'hey', 'heya', 'heyy', 'howdy', 'thanks', 'thank', 'thx',
  'bye', 'goodbye', 'ok', 'okay', 'yes', 'no', 'yep', 'nope'
]);

// Common Urdu / Roman Urdu stopwords
const STOPWORDS_UR = new Set([
  'کا', 'کی', 'کے', 'کو', 'پر', 'سے', 'میں', 'ہے', 'ہیں', 'تھا', 'تھی', 'تھے',
  'اور', 'یا', 'کیا', 'کیسے', 'کیوں', 'کب', 'والا', 'والی', 'والے', 'کریں', 'ہو',
  'سلام', 'ہیلو', 'ہائے', 'شکریہ', 'مہربانی', 'ٹھیک', 'اچھا'
]);

/**
 * Pre-computes document statistics for BM25/TF-IDF across knowledge base chunks.
 */
class CorpusIndex {
  constructor(chunks) {
    this.chunks = chunks;
    this.docCount = chunks.length;
    this.docTokens = new Map();
    this.df = new Map(); // Document frequency per token
    this.avgDocLen = 0;

    this._buildIndex();
  }

  _buildIndex() {
    let totalLen = 0;

    for (const chunk of this.chunks) {
      const tokens = this._tokenizeChunk(chunk);
      this.docTokens.set(chunk.id, tokens);
      totalLen += tokens.length;

      const uniqueTokens = new Set(tokens);
      for (const token of uniqueTokens) {
        this.df.set(token, (this.df.get(token) || 0) + 1);
      }
    }

    this.avgDocLen = this.docCount > 0 ? totalLen / this.docCount : 1;
  }

  _tokenizeChunk(chunk) {
    const text = [
      chunk.title || '',
      chunk.content || '',
      chunk.content_ur || '',
      ...(Array.isArray(chunk.tags) ? chunk.tags : []),
      chunk.crop_id || '',
      chunk.disease_id || '',
    ].join(' ');

    return tokenizeText(text);
  }

  getIdf(token) {
    const docFreq = this.df.get(token) || 0;
    // Standard smoothed BM25 IDF
    return Math.log(1 + (this.docCount - docFreq + 0.5) / (docFreq + 0.5));
  }
}

// Global cached index for performance
let globalCorpusIndex = null;
function getCorpusIndex() {
  if (!globalCorpusIndex) {
    globalCorpusIndex = new CorpusIndex(KNOWLEDGE_CHUNKS);
  }
  return globalCorpusIndex;
}

/**
 * Normalizes and tokenizes text into lowercase words/tokens.
 * Handles English alphanumeric, punctuation removal, and Urdu unicode ranges.
 *
 * @param {string} text
 * @returns {string[]}
 */
export function tokenizeText(text) {
  if (!text || typeof text !== 'string') return [];

  // Match English words, numbers, and Urdu / Arabic unicode script sequences
  const rawTokens = text
    .toLowerCase()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()?"'’]/g, ' ')
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 1);

  return rawTokens.filter((token) => !STOPWORDS_EN.has(token) && !STOPWORDS_UR.has(token));
}

/**
 * Searches the knowledge base using hybrid TF-IDF + field weighting + metadata filtering.
 *
 * @param {string} query - Farmer query (English or Urdu)
 * @param {object} [options]
 * @param {string} [options.cropId] - Optional filter/boost by crop (e.g. 'wheat')
 * @param {string} [options.diseaseId] - Optional filter/boost by disease (e.g. 'wheat_yellow_rust')
 * @param {string} [options.category] - Optional category filter ('disease_mgmt' | 'pesticide' | 'agronomy' | 'advisory')
 * @param {number} [options.limit=5] - Maximum number of chunks to return
 * @param {number} [options.minScore=0.5] - Minimum relevance score
 * @returns {{ results: Array<{ chunk: object, score: number, citation: string }>, totalFound: number, fallbackAdvice: string|null }}
 */
export function searchKnowledgeBase(query, options = {}) {
  const {
    cropId = null,
    diseaseId = null,
    category = null,
    limit = 5,
    minScore = 0.5,
  } = options;

  const normalizedQuery = (query || '').trim();
  const queryTokens = tokenizeText(normalizedQuery);
  const normalizedCrop = cropId ? cropId.toLowerCase().trim() : null;
  const normalizedDisease = diseaseId ? diseaseId.toLowerCase().trim() : null;

  // If query is empty and no crop/disease filter given, return empty with fallback
  if (queryTokens.length === 0 && !normalizedCrop && !normalizedDisease) {
    return {
      results: [],
      totalFound: 0,
      fallbackAdvice: getFallbackAdvisory(normalizedCrop),
    };
  }

  // If query consists only of stopwords/greetings and no specific diseaseId is targeted, return empty
  if (normalizedQuery.length > 0 && queryTokens.length === 0 && !normalizedDisease) {
    return {
      results: [],
      totalFound: 0,
      fallbackAdvice: null,
    };
  }

  const index = getCorpusIndex();
  const scoredChunks = [];

  for (const chunk of KNOWLEDGE_CHUNKS) {
    // 1. Strict category filter if specified
    if (category && chunk.category !== category) {
      continue;
    }

    // 2. Strict crop filtering if cropId is provided (allow general/null chunks as well)
    if (normalizedCrop && chunk.crop_id && chunk.crop_id !== normalizedCrop) {
      continue;
    }

    // 3. Compute relevance score
    let score = 0;
    const chunkTokens = index.docTokens.get(chunk.id) || [];
    const docLen = chunkTokens.length || 1;

    // Field-based texts for specific weight boosts
    const titleTokens = new Set(tokenizeText(chunk.title || ''));
    const tagTokens = new Set((chunk.tags || []).map((t) => t.toLowerCase()));
    const contentTokens = tokenizeText((chunk.content || '') + ' ' + (chunk.content_ur || ''));

    // Count term frequencies in content
    const contentTf = new Map();
    for (const token of contentTokens) {
      contentTf.set(token, (contentTf.get(token) || 0) + 1);
    }

    // Evaluate each query token against chunk
    for (const qToken of queryTokens) {
      const idf = index.getIdf(qToken);
      let termScore = 0;

      // Tag match — highest signal (weight: 5.0)
      if (tagTokens.has(qToken)) {
        termScore += 5.0;
      }

      // Title match — very high signal (weight: 3.5)
      if (titleTokens.has(qToken)) {
        termScore += 3.5;
      }

      // Content BM25 term frequency
      const tf = contentTf.get(qToken) || 0;
      if (tf > 0) {
        // BM25 TF formula: (tf * (k1 + 1)) / (tf + k1 * (1 - b + b * (docLen / avgDocLen)))
        const k1 = 1.2;
        const b = 0.75;
        const tfWeight = (tf * (k1 + 1)) / (tf + k1 * (1 - b + b * (docLen / index.avgDocLen)));
        termScore += tfWeight * 1.5;
      }

      // Substring fuzzy matching for Urdu/compound names (minimum 4 characters to prevent accidental substrings)
      if (qToken.length >= 4 && chunk.content && chunk.content.toLowerCase().includes(qToken)) {
        termScore += 0.5;
      }

      score += termScore * idf;
    }

    // 4. Exact full query phrase matching boost
    const lowerContent = ((chunk.title || '') + ' ' + (chunk.content || '')).toLowerCase();
    if (normalizedQuery.length > 3 && lowerContent.includes(normalizedQuery.toLowerCase())) {
      score += 8.0;
    }

    // 5. Metadata contextual boosts (only apply if query terms matched or browsing with empty query)
    const hasQueryMatch = normalizedQuery.length === 0 ? true : score > 0;
    if (hasQueryMatch) {
      if (normalizedDisease && chunk.disease_id === normalizedDisease) {
        score += 10.0; // Major boost for disease direct match
      }

      if (normalizedCrop && chunk.crop_id === normalizedCrop) {
        score += 3.0; // Boost for targeted crop match
      }
    }

    // 6. Filter by minScore threshold
    if (score >= minScore) {
      scoredChunks.push({
        chunk,
        score: Math.round(score * 100) / 100,
        citation: chunk.source || 'Cropex Agricultural Knowledge Base',
      });
    }
  }

  // Sort descending by score
  scoredChunks.sort((a, b) => b.score - a.score);

  const topResults = scoredChunks.slice(0, Math.min(limit, 10));

  return {
    results: topResults,
    totalFound: scoredChunks.length,
    fallbackAdvice: topResults.length === 0 ? getFallbackAdvisory(normalizedCrop) : null,
  };
}

/**
 * Returns formatted RAG context blocks for injection into LLM prompts.
 *
 * @param {Array<{ chunk: object, score: number, citation: string }>} results
 * @returns {string} Formatted context block
 */
export function formatRagContextForPrompt(results) {
  if (!Array.isArray(results) || results.length === 0) {
    return 'NO RELEVANT LOCAL RESEARCH FOUND. If the farmer asks for a diagnosis or treatment, recommend consulting an agricultural extension officer.';
  }

  return results
    .map((r, idx) => {
      const c = r.chunk;
      const cropLabel = c.crop_id ? `[Crop: ${c.crop_id.toUpperCase()}]` : '[General Advisory]';
      const diseaseLabel = c.disease_id ? `[Disease: ${c.disease_id}]` : '';
      return `--- SOURCE [${idx + 1}]: ${c.title} ${cropLabel} ${diseaseLabel} (Citation: ${r.citation}) ---
${c.content}
${c.content_ur ? `Urdu Summary: ${c.content_ur}` : ''}`;
    })
    .join('\n\n');
}

/**
 * Standard disclaimer and extension officer escalation advisory.
 *
 * @param {string|null} [cropId]
 * @returns {string}
 */
export function getFallbackAdvisory(cropId) {
  const cropStr = cropId ? ` for ${cropId}` : '';
  return `No specific local research document matched your question${cropStr}. For accurate, safe guidance, please contact your local district agricultural extension officer (Zila Agriculture Office) or call the NARC Farmer Helpline at 051-9255000 or Punjab Agricultural Helpline at 0800-22444.`;
}
