/**
 * Vercel Serverless Function: Secure Groq Text Advisor Rephraser
 * -------------------------------------------------------------
 * Receives deterministic advisor outputs and rephrases them in warmer,
 * natural language (Urdu, Punjabi Shahmukhi, or English) using Llama-3.1-8b-instruct.
 */

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight options request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { priority, headline, reasoning, language } = req.body;
    
    if (!headline || !reasoning) {
      return res.status(400).json({ error: 'Missing advisor content payloads' });
    }

    const apiKey = process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: 'Groq API key is not configured.'
      });
    }

    // Determine target language name
    let targetLang = 'English';
    let scriptInstructions = '';

    if (language === 'ur') {
      targetLang = 'Urdu';
      scriptInstructions = 'Write in standard Urdu Script (Arabic/Persian Nastaliq script).';
    } else if (language === 'pa') {
      targetLang = 'Punjabi (Shahmukhi)';
      scriptInstructions = 'Write in Shahmukhi Script (Perso-Arabic script used in Pakistani Punjab, NOT Gurmukhi). E.g. using standard Urdu/Arabic alphabets like "فصل نوں بچان لئی...". Do not use Gurmukhi/Indian characters.';
    }

    const GROQ_MODEL = 'llama-3.1-8b-instant';

    const systemMessage = {
      role: 'system',
      content: `You are the Cropex AI Farm Advisor, a warm, helpful agricultural expert in Pakistan who speaks directly and politely to local farmers.
Your job is to rephrase the raw, dry, deterministic farm alerts into encouraging, natural, and warm messages.
Keep the advice highly actionable and clear. Maintain a friendly and respectful tone.

You MUST write the output in ${targetLang}.
* ${scriptInstructions}
* Never use written words for numbers or measurements. Keep all temperatures, percentages, and days in standard Western digits (like 18°C, 92%, 4, 30000, etc.) embedded in the Urdu or Shahmukhi sentences. E.g. "درجہ حرارت 18°C ہے" (do not translate digits, keep 18°C).

You must respond ONLY with a valid JSON object matching this schema:
{
  "headline": "Warmer and encouraging version of the raw headline (max 12 words)",
  "reasoning": "Polite, warm, and explanatory version of the raw reasoning (max 25 words)"
}

Do not include any introductory or concluding text. Do not wrap the JSON in markdown code blocks. Return only raw JSON.`
    };

    const userMessage = {
      role: 'user',
      content: `Raw Alert Information to Rephrase:
- Priority: ${priority}
- Raw Headline: "${headline}"
- Raw Reasoning: "${reasoning}"
- Language: ${targetLang} (${scriptInstructions})`
    };

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [systemMessage, userMessage],
        temperature: 0.3,
        max_tokens: 256,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({
        error: `Groq API error (${response.status}): ${errorText}`
      });
    }

    const data = await response.json();
    const rawContent = data?.choices?.[0]?.message?.content;
    
    if (typeof rawContent !== 'string') {
      return res.status(500).json({ error: 'Unexpected response format from Groq API.' });
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

    const parsed = JSON.parse(cleanContent);
    return res.status(200).json(parsed);

  } catch (error) {
    console.error('Serverless function error:', error);
    return res.status(500).json({ 
      error: error.message || 'An internal error occurred while rephrasing.' 
    });
  }
}
