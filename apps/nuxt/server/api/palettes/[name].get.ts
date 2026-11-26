const apiUrl = process.env.API_URL ?? 'http://127.0.0.1:4000';

export default defineEventHandler((event) => {
  const { pathname, search } = getRequestURL(event);
  const upstream = new URL(apiUrl);
  upstream.pathname = pathname;
  upstream.search = search;

  return proxyRequest(event, upstream.href, { fetchOptions: { redirect: 'manual' } });
});
