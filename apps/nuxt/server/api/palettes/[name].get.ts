import { paletteApiOrigin } from '../../utils/paletteApiOrigin.ts';

export default defineEventHandler((event) => {
  const { pathname, search } = getRequestURL(event);
  const upstream = new URL(paletteApiOrigin);
  upstream.pathname = pathname;
  upstream.search = search;

  return proxyRequest(event, upstream.href, { fetchOptions: { redirect: 'manual' } });
});
