import { serve } from '@hono/node-server';
import { Hono } from 'hono';

const app = new Hono().basePath('/api');

app.get('/palettes/:name', (context) => {
  const name = context.req.param('name');
  if (name === 'aurora') return context.json(['indigo', 'harbor blue']);
  if (name === 'mist') return context.json([]);
  return context.notFound();
});
app.notFound((context) => context.json({ error: 'Not found' }, 404));

const hostname = process.env.HOST ?? '127.0.0.1';
const port = Number(process.env.PORT ?? 4000);

serve({ fetch: app.fetch, hostname, port }, (info) => {
  console.log(`Palette API listening on ${info.address} port ${info.port}`);
});
