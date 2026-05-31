import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { classifyTransactionsHandler, generateFinancialNarrativeHandler, chatWithAIHandler } from './src/api-handlers.ts';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json());

// API Endpoints
app.post('/api/classify', async (req, res) => {
  try {
    const result = await classifyTransactionsHandler(req.body.transactions || []);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/narrative', async (req, res) => {
  try {
    const result = await generateFinancialNarrativeHandler(req.body.data || {});
    res.json({ narrative: result });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/chat', async (req, res) => {
  try {
    const result = await chatWithAIHandler(req.body.message, req.body.history || [], req.body.financialState || {});
    res.json({ response: result });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Serve static assets from Vite build output folder ('dist')
const distPath = path.join(process.cwd(), 'dist');

app.use(express.static(distPath));

// Fallback all other routing to Single Page App index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Production server running on http://0.0.0.0:${PORT}`);
});
