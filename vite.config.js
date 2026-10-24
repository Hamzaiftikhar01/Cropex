import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

/**
 * Vite Dev Middleware for Vercel Serverless Functions
 * Enables local execution of /api/chat, /api/analyze, /api/rag, and /api/rephrase.
 */
function localApiDevPlugin() {
  return {
    name: 'local-api-dev-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url || !req.url.startsWith('/api/')) return next();

        const urlPath = req.url.split('?')[0];
        const apiName = urlPath.replace(/^\/api\//, '');

        try {
          let handler;
          if (apiName === 'chat') {
            handler = (await import('./api/chat.js')).default;
          } else if (apiName === 'analyze') {
            handler = (await import('./api/analyze.js')).default;
          } else if (apiName === 'rag') {
            handler = (await import('./api/rag.js')).default;
          } else if (apiName === 'rephrase') {
            handler = (await import('./api/rephrase.js')).default;
          } else if (apiName === 'tts') {
            handler = (await import('./api/tts.js')).default;
          }

          if (!handler) return next();

          // Parse query string for GET requests
          const parsedUrl = new URL(req.url, 'http://localhost');
          req.query = Object.fromEntries(parsedUrl.searchParams);

          // Collect body for POST/PUT requests
          let body = {};
          if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
            const buffers = [];
            for await (const chunk of req) {
              buffers.push(chunk);
            }
            const rawBody = Buffer.concat(buffers).toString('utf8');
            if (rawBody) {
              try {
                body = JSON.parse(rawBody);
              } catch {
                body = {};
              }
            }
          }
          req.body = body;

          // Polyfill res.status, res.json, and res.send for Vercel Serverless Function compatibility
          res.status = function (statusCode) {
            res.statusCode = statusCode;
            return res;
          };
          res.json = function (data) {
            if (!res.headersSent) {
              res.setHeader('Content-Type', 'application/json');
            }
            res.end(JSON.stringify(data));
            return res;
          };
          res.send = function (data) {
            if (Buffer.isBuffer(data)) {
              if (!res.headersSent && !res.getHeader('Content-Type')) {
                res.setHeader('Content-Type', 'audio/mpeg');
              }
              res.end(data);
            } else if (typeof data === 'object') {
              if (!res.headersSent) {
                res.setHeader('Content-Type', 'application/json');
              }
              res.end(JSON.stringify(data));
            } else {
              res.end(String(data));
            }
            return res;
          };

          await handler(req, res);
        } catch (err) {
          console.error('[localApiDevPlugin] Error handling', req.url, err);
          if (!res.headersSent) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message || 'Internal Dev Server Error' }));
          }
        }
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  // Populate process.env so local serverless handlers have access to the API key
  process.env.GROQ_API_KEY = env.GROQ_API_KEY || env.VITE_GROQ_API_KEY;

  return {
    plugins: [
      localApiDevPlugin(),
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        devOptions: {
          enabled: true,
        },
        manifest: {
          name: 'Cropex AI',
          short_name: 'Cropex',
          description: 'AI Farm Advisor',
          theme_color: '#15803D',
          icons: [
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
            },
          ],
        },
      }),
    ],
  };
});