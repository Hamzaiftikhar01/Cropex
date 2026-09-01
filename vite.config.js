import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

function ttsDevPlugin() {
  return {
    name: 'tts-dev-middleware',
    configureServer(server) {
      server.middlewares.use('/api/tts', async (req, res) => {
        try {
          const url = new URL(req.url, `http://${req.headers.host}`);
          const text = url.searchParams.get('text');
          const lang = url.searchParams.get('lang') || 'ur';

          if (!text) {
            res.statusCode = 400;
            res.end('Missing text query parameter');
            return;
          }

          const ttsLang = lang === 'en' ? 'en' : 'ur';
          const googleUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${ttsLang}&client=tw-ob&q=${encodeURIComponent(text.slice(0, 200))}`;

          const fetchRes = await fetch(googleUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
          });

          if (!fetchRes.ok) {
            res.statusCode = fetchRes.status;
            res.end('TTS stream error');
            return;
          }

          const buf = await fetchRes.arrayBuffer();
          res.setHeader('Content-Type', 'audio/mpeg');
          res.setHeader('Cache-Control', 'public, max-age=86400');
          res.end(Buffer.from(buf));
        } catch (err) {
          res.statusCode = 500;
          res.end(err.message || 'Internal Server Error');
        }
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    ttsDevPlugin(),
  ],
});