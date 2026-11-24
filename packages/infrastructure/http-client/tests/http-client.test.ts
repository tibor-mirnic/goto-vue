import { expect, expectTypeOf, test, vi } from 'vite-plus/test';
import { HttpError, createHttpClient } from '../src/index.ts';

const colorsPath = '/api/palettes/aurora/colors';

test('GETs the given path and returns the decoder result', async () => {
  const fetch = vi.fn().mockResolvedValue(Response.json(['indigo', 'teal']));
  const result = createHttpClient(fetch).getJson(colorsPath, {
    parse: (value) => {
      expectTypeOf(value).toEqualTypeOf<unknown>();
      expect(value).toEqual(['indigo', 'teal']);
      if (!Array.isArray(value)) throw new TypeError('Expected an array');
      return value.length;
    }
  });

  expectTypeOf(result).toEqualTypeOf<Promise<number>>();
  expect(await result).toBe(2);
  expect(fetch).toHaveBeenCalledExactlyOnceWith(colorsPath, expect.objectContaining({ method: 'GET' }));
});

test('rejects with the HTTP status before consuming an error response', async () => {
  const response = new Response('Service Unavailable', { status: 503 });
  const http = createHttpClient(async () => response);
  const parse = vi.fn();

  const result = http.getJson(colorsPath, { parse });
  await expect(result).rejects.toBeInstanceOf(HttpError);
  await expect(result).rejects.toMatchObject({ status: 503 });
  expect(response.bodyUsed).toBe(false);
  expect(parse).not.toHaveBeenCalled();
});

test('propagates a network failure', async () => {
  const error = new TypeError('Network failure');
  const http = createHttpClient(vi.fn().mockRejectedValue(error));

  await expect(http.getJson(colorsPath, { parse: vi.fn() })).rejects.toBe(error);
});

test('forwards the caller’s signal and propagates its abort reason', async () => {
  const signal = AbortSignal.abort();
  const http = createHttpClient(async (_path, init) => {
    expect(init.signal).toBe(signal);
    init.signal?.throwIfAborted();
    return Response.json([]);
  });

  await expect(http.getJson(colorsPath, { parse: vi.fn(), signal })).rejects.toBe(signal.reason);
});

test('propagates malformed JSON before calling the decoder', async () => {
  const http = createHttpClient(async () => new Response('{'));
  const parse = vi.fn();

  await expect(http.getJson(colorsPath, { parse })).rejects.toBeInstanceOf(SyntaxError);
  expect(parse).not.toHaveBeenCalled();
});

test('propagates the decoder’s error for an unexpected JSON value', async () => {
  const http = createHttpClient(async () => Response.json(null));
  const error = new TypeError('Expected an array');
  const result = http.getJson(colorsPath, {
    parse: (value) => {
      if (!Array.isArray(value)) throw error;
      return value;
    }
  });

  await expect(result).rejects.toBe(error);
});
