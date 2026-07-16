/**
 * Vercel Serverless Function: Secure Groq Vision Proxy
 * --------------------------------------------------
 * Receives base64 image data from frontend client, calls Groq API using 
 * secure server-side environment variables, and returns the response.
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
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ error: 'Missing image payload' });
    }

    // Look for secure server key first (GROQ_API_KEY), fallback to VITE_GROQ_API_KEY
    const apiKey = process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: 'Groq API key is not configured. Please add GROQ_API_KEY to your Vercel Environment Variables.'
      });
    }

    const GROQ_MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct';

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

    const userMessage = {
      role: 'user',
      content: [
        { type: 'text', text: 'Identify the crop and disease in this image and output the results as a JSON object.' },
        { type: 'image_url', image_url: { url: image } }
      ]
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
        temperature: 0.1,
        max_tokens: 512,
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

    // Clean JSON content if wrapped in markdown
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
      error: error.message || 'An internal error occurred while processing the leaf image.' 
    });
  }
}
