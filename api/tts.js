/**
 * Vercel Serverless Function: TTS Voice Proxy
 * -------------------------------------------------------------
 * Provides high-fidelity Urdu, Punjabi, and English voice streams
 * with zero CORS restrictions.
 */

function splitIntoSpeechChunks(text, maxLen = 160) {
  if (!text) return [];
  // Split on sentence boundaries: Urdu full stop (۔), Arabic question mark (؟), exclamation, newlines, English period/question
  const sentences = text.match(/[^۔!؟\n.?]+[۔!؟\n.?]*/g) || [text];
  const chunks = [];
  let current = '';

  for (const s of sentences) {
    const trimmed = s.trim();
    if (!trimmed) continue;
    if ((current + ' ' + trimmed).length <= maxLen) {
      current = current ? current + ' ' + trimmed : trimmed;
    } else {
      if (current) chunks.push(current);
      if (trimmed.length <= maxLen) {
        current = trimmed;
      } else {
        // Sub-split by comma, colon, or whitespace
        const words = trimmed.split(/\s+/);
        let sub = '';
        for (const w of words) {
          if ((sub + ' ' + w).length <= maxLen) {
            sub = sub ? sub + ' ' + w : w;
          } else {
            if (sub) chunks.push(sub);
            sub = w;
          }
        }
        current = sub;
      }
    }
  }
  if (current) chunks.push(current);
  return chunks.slice(0, 6); // Limit to maximum 6 chunks (~1000 chars) for fast streaming
}

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const text = (req.query?.text || req.body?.text || '').trim();
    const lang = req.query?.lang || req.body?.lang || 'ur';

    if (!text) {
      return res.status(400).send('Missing text parameter');
    }

    // Use 'en' for English, 'ur' for Urdu and Punjabi Shahmukhi
    const ttsLang = lang === 'en' ? 'en' : 'ur';
    const chunks = splitIntoSpeechChunks(text, 160);

    if (chunks.length === 0) {
      return res.status(400).send('No valid speech text found');
    }

    const audioBuffers = [];
    for (const chunk of chunks) {
      const googleTtsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${ttsLang}&client=tw-ob&q=${encodeURIComponent(chunk)}`;
      const response = await fetch(googleTtsUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': 'https://translate.google.com/'
        }
      });

      if (response.ok) {
        const arrayBuffer = await response.arrayBuffer();
        audioBuffers.push(Buffer.from(arrayBuffer));
      }
    }

    if (audioBuffers.length === 0) {
      return res.status(502).send('TTS upstream provider error');
    }

    const combinedBuffer = Buffer.concat(audioBuffers);

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.status(200).send(combinedBuffer);
  } catch (error) {
    console.error('TTS Proxy Error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
