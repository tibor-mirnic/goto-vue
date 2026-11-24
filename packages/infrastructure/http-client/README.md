# @goto/infrastructure-http-client

The host supplies `fetch` to this private, framework-independent HTTP client. Call `getJson` with a path and a decoder. The decoder receives `unknown` and its return type determines the result.

```ts
import { createHttpClient } from '@goto/infrastructure-http-client';

const http = createHttpClient(fetch);

const parseColorNames = (value: unknown): string[] => {
  if (!Array.isArray(value) || !value.every((name) => typeof name === 'string')) {
    throw new TypeError('Expected an array of strings');
  }
  return value;
};

const colorNames = await http.getJson('/api/palettes/aurora/colors', { parse: parseColorNames });
```

Pass an optional `signal` alongside `parse` to cancel the request. A non-2xx response throws `HttpError` with the numeric response `status` before the client reads the body. Network failures, aborts, JSON syntax errors and decoder errors propagate to the caller.
