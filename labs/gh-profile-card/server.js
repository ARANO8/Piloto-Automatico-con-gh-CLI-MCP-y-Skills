import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 3000;

const app = express();
app.use(express.static(path.join(__dirname, 'public'), { extensions: ['html'] }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'gh-profile-card' });
});

app.listen(PORT, () => {
  console.log(`\n  GitHub Profile Card  ->  http://localhost:${PORT}\n`);
});