import { serve } from '@hono/node-server';
import { Hono } from 'hono';

const app = new Hono().basePath('/api');

app.get('/palettes/aurora.json', (context) => context.json(['indigo', 'harbor blue']));
app.get('/palettes/mist.json', (context) => context.json([]));
app.notFound((context) => context.json({ error: 'Not found' }, 404));

const hostname = process.env.HOST ?? '127.0.0.1';
const port = Number(process.env.PORT ?? 4000);

serve({ fetch: app.fetch, hostname, port }, (info) => {
  console.log(`Palette API listening on ${info.address} port ${info.port}`);
});
