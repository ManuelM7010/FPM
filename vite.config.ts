import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables for local testing
dotenv.config();

// Helper to parse POST request JSON bodies in Node.js connect middlewares
function parseJsonBody(req: any): Promise<any> {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk: any) => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        resolve({});
      }
    });
  });
}

export default defineConfig(() => {
  return {
    plugins: [
      react(), 
      tailwindcss(),
      {
        name: 'api-server-middleware',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (!req.url) return next();

            // API Endpoint: Classify Transactions
            if (req.url.startsWith('/api/classify') && req.method === 'POST') {
              try {
                const body = await parseJsonBody(req);
                const { classifyTransactionsHandler } = await import('./src/api-handlers.ts');
                const result = await classifyTransactionsHandler(body.transactions || []);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(result));
              } catch (err: any) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: err.message }));
              }
              return;
            }

            // API Endpoint: Financial Narrative Generation
            if (req.url.startsWith('/api/narrative') && req.method === 'POST') {
              try {
                const body = await parseJsonBody(req);
                const { generateFinancialNarrativeHandler } = await import('./src/api-handlers.ts');
                const result = await generateFinancialNarrativeHandler(body.data || {});
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ narrative: result }));
              } catch (err: any) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: err.message }));
              }
              return;
            }

            // API Endpoint: AI Financial Chat Assistant
            if (req.url.startsWith('/api/chat') && req.method === 'POST') {
              try {
                const body = await parseJsonBody(req);
                const { chatWithAIHandler } = await import('./src/api-handlers.ts');
                const result = await chatWithAIHandler(body.message, body.history || [], body.financialState || {});
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ response: result }));
              } catch (err: any) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: err.message }));
              }
              return;
            }

            next();
          });
        }
      }
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
