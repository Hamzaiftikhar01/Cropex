/**
 * Vercel Serverless Function: Secure Groq Vision Proxy — Phase 2
 * ---------------------------------------------------------------
 * - Accepts a base64 image from the frontend
 * - Validates file type, size, and content
 * - Enforces per-IP rate limiting (20 req / min)
 * - Calls Groq using the secure GROQ_API_KEY server env var (never VITE_*)
 * - Scoped VLM prompt: model selects from the 6-crop taxonomy only
 * - Returns structured JSON including disease_id for downstream linking
 */

import { checkRateLimit, getClientIp } from './_rateLimit.js';
import { buildTaxonomyPromptBlock, DISEASE_TAXONOMY } from '../src/lib/diseaseTaxonomy.js';
import { searchKnowledgeBase } from '../src/lib/ragSearch.js';
import {
  getRegisteredProductsForDiagnosis,
  auditTreatmentSafety,
} from '../src/lib/pesticideRegistry.js';

// Constants — Phase 2: upgraded to a stronger vision model
const GROQ_MODEL = 'qwen/qwen3.8-27b';
const MAX_IMAGE_BYTES = 4 * 1024 * 1024; // 4 MB after compression
const ALLOWED_MIME_PREFIXES = ['data:image/jpeg', 'data:image/png', 'data:image/webp'];
const RATE_LIMIT_MAX = 20;
const RATE_LIMIT_WINDOW_MS = 60_000;

// Pre-build once at cold-start, not per-request
const TAXONOMY_BLOCK = buildTaxonomyPromptBlock();

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
  const apiKey = process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: 'Server is missing GROQ_API_KEY. Contact the administrator.',
    });
  }

  // ── Groq request ────────────────────────────────────────────────────────────
  // Pull the hinted crop from the request body (optional, sent by DiseaseView)
  const { cropHint } = req.body || {};
  const cropHintStr = typeof cropHint === 'string' ? cropHint.trim().toLowerCase() : null;
  const hintedCrop = cropHintStr && DISEASE_TAXONOMY[cropHintStr]
    ? DISEASE_TAXONOMY[cropHintStr].name
    : null;

  try {
    const systemMessage = {
      role: 'system',
      content: `You are Cropex AI, a precision agricultural vision assistant for Pakistani farmers.

DISCLAIMER: AI diagnosis only. Results are indicative and must be verified by a qualified agronomist before any treatment.

${hintedCrop ? `The farmer has indicated this is a ${hintedCrop} field. Prioritise ${hintedCrop} in your analysis.` : ''}

You have been trained on the following SUPPORTED crops and diseases for Pakistan:

${TAXONOMY_BLOCK}

INSTRUCTIONS:
1. First determine: does the image contain a crop, plant leaf, or stem?
   - If NO: return { "isCrop": false, "message": "Please upload a clear image of a crop or plant leaf." }
2. Identify the crop. If it matches one of the supported crops above, use that crop's exact name.
3. Identify the disease. You MUST pick from the taxonomy list above when possible (use the [disease_id] in brackets).
   - If the plant is healthy, set disease to "Healthy" and disease_id to "healthy".
   - If you see a condition not in the list, still describe it but set disease_id to "unknown".
4. Set confidence (0–100). Be honest — low quality images should get lower scores.
   - Confidence < 70 means the farmer should retake the photo or consult an expert.
5. Recommended actions & Treatment Safety (DPP Pakistan Compliance):
   - ONLY suggest chemicals registered with the Pakistan Department of Plant Protection (DPP).
   - NEVER invent or guess dosages. Refer strictly to the registered label dose or extension officer advice.
   - BANNED SUBSTANCES: NEVER mention or recommend banned/cancelled chemicals in Pakistan (Endosulfan, Monocrotophos, DDT, Dieldrin, Aldrin, Heptachlor, Methyl Parathion, Methamidophos, Phosphamidon, Chlordane).
   - Emphasise Pre-Harvest Interval (PHI) compliance for food safety.

Return ONLY valid JSON, no markdown, no code fences:
{
  "isCrop": true,
  "crop": "Crop name",
  "disease": "Disease name or 'Healthy'",
  "disease_id": "taxonomy_id_or_unknown_or_healthy",
  "confidence": 85,
  "severity": "Low | Moderate | High",
  "description": "...",
  "visibleSymptoms": ["..."],
  "likelyCauses": ["..."],
  "recommendedActions": ["..."],
  "analysisSummary": "...",
  "disclaimer": "AI diagnosis only. Verify with a certified agronomist before applying any treatment."
}`,

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

    // Phase 3: RAG Knowledge Base enrichment for grounded diagnosis treatment
    if (parsed.isCrop && parsed.disease_id && parsed.disease_id !== 'healthy') {
      try {
        const ragRes = searchKnowledgeBase(`${parsed.crop || ''} ${parsed.disease || ''}`, {
          cropId: cropHintStr || (parsed.crop ? parsed.crop.toLowerCase() : null),
          diseaseId: parsed.disease_id,
          limit: 3,
        });

        if (ragRes.results && ragRes.results.length > 0) {
          parsed.verifiedSources = ragRes.results.map((r) => ({
            id: r.chunk.id,
            title: r.chunk.title,
            source: r.chunk.source,
            content: r.chunk.content,
            content_ur: r.chunk.content_ur || null,
          }));

          // Add grounded treatment block with explicit citation
          const primaryTreatmentChunk = ragRes.results.find(
            (r) => r.chunk.category === 'disease_mgmt' || r.chunk.category === 'pesticide'
          );
          if (primaryTreatmentChunk) {
            parsed.groundedTreatment = {
              source: primaryTreatmentChunk.chunk.source,
              title: primaryTreatmentChunk.chunk.title,
              guidance: primaryTreatmentChunk.chunk.content,
              guidance_ur: primaryTreatmentChunk.chunk.content_ur || null,
            };
          }
        } else {
          parsed.fallbackAdvice = ragRes.fallbackAdvice;
        }
      } catch (ragErr) {
        console.error('[analyze] RAG enrichment error:', ragErr);
      }
    }

    // Phase 5: Pakistan DPP Treatment Safety Audit & Registered Products Enrichment
    const combinedTreatmentText = [
      parsed.analysisSummary,
      ...(parsed.recommendedActions || []),
      ...(parsed.likelyCauses || []),
    ].filter(Boolean).join(' ');

    const safetyAudit = auditTreatmentSafety(combinedTreatmentText);
    parsed.safetyAudit = safetyAudit;

    // Proactively check banned substances and filter hazardous recommendations if found
    if (!safetyAudit.isSafe) {
      console.warn('[analyze] Safety audit detected banned chemical mentions:', safetyAudit.bannedMatches);
      parsed.safetyWarnings = safetyAudit.warnings;
      if (Array.isArray(parsed.recommendedActions)) {
        parsed.recommendedActions = parsed.recommendedActions.filter((act) => {
          return !safetyAudit.bannedMatches.some((b) =>
            act.toLowerCase().includes(b.activeIngredient.toLowerCase())
          );
        });
      }
    }

    // Attach official DPP-registered products matching crop & disease
    const registeredProducts = getRegisteredProductsForDiagnosis(parsed.crop, parsed.disease);
    if (registeredProducts.length > 0) {
      parsed.dppRegisteredProducts = registeredProducts;
      parsed.recommendedProducts = registeredProducts.map((p) => ({
        id: p.id,
        name: p.name,
        companyName: p.company,
        company: p.company,
        productType: p.productType,
        activeIngredient: p.activeIngredient,
        dosage: p.labelDosageAcre,
        labelDosageAcre: p.labelDosageAcre,
        dppRegistrationNo: p.dppRegistrationNo,
        phiDays: p.phiDays,
        whoToxicityClass: p.whoToxicityClass,
        protectiveEquipment: p.protectiveEquipment,
        officialProductUrl: p.officialUrl,
        description: p.safetyInstructions,
      }));
    }

    // Phase 5: Escalation threshold — confidence < 70% or High severity
    const numericConfidence = typeof parsed.confidence === 'number'
      ? parsed.confidence
      : parseInt(parsed.confidence, 10) || 0;

    parsed.requiresExpertEscalation = numericConfidence < 70 || parsed.severity === 'High';

    return res.status(200).json(parsed);

  } catch (err) {
    if (err.name === 'AbortError') {
      return res.status(504).json({ error: 'AI service timed out. Please try again.' });
    }
    console.error('[analyze] Unhandled error:', err);
    return res.status(500).json({ error: 'Internal server error. Please try again.' });
  }
}
