import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

async function ensureStorage() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR);
  }
  
  try {
    await fs.access(DB_FILE);
  } catch {
    await fs.writeFile(DB_FILE, JSON.stringify({
      fs_v1: null,
      settings_v1: {},
      users_v1: [],
      collections: {
        emails: [],
        messages: [],
        db_metadata: {
          created_at: new Date().toISOString(),
          version: "1.0.0"
        }
      }
    }));
  }
}

async function startServer() {
  await ensureStorage();
  const app = express();
  app.use(express.json({ limit: '50mb' }));

  // Middleware for API Authentication
  const apiAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const token = req.headers['x-glass-token'];
    const systemToken = process.env.STORAGE_ACCESS_TOKEN || 'glass_os_core_token_2026';
    if (token !== systemToken) {
      return res.status(401).json({ error: 'Unauthorized Access: Invalid System Token' });
    }
    next();
  };

  // API Routes
  app.get('/api/status', (req, res) => {
    res.json({ status: 'online', service: 'GlassOS Persistence Engine' });
  });

  app.get('/api/storage', apiAuth, async (req, res) => {
    const data = await fs.readFile(DB_FILE, 'utf-8');
    res.json(JSON.parse(data));
  });

  app.post('/api/storage', apiAuth, async (req, res) => {
    try {
      const currentData = JSON.parse(await fs.readFile(DB_FILE, 'utf-8'));
      // Basic schema validation
      if (!req.body || typeof req.body !== 'object') {
        return res.status(400).json({ error: 'Invalid Payload' });
      }
      const newData = { ...currentData, ...req.body };
      await fs.writeFile(DB_FILE, JSON.stringify(newData, null, 2));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to save data' });
    }
  });

  // Vite Middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`GlassOS Server running on http://localhost:${PORT}`);
  });
}

startServer();
