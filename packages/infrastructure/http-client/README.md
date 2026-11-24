# @goto/infrastructure-http-client

A private, framework-independent TypeScript package for HTTP requests. The package currently exports `HttpError`. Its `status` property holds the numeric HTTP response status.

## Planned first request

The proposed first caller is a feature that loads tickets for an event. Once `createHttpClient` is implemented, the host will supply `fetch` and the feature will supply a decoder that accepts `unknown` and returns its ticket list.

```ts
import { createHttpClient } from '@goto/infrastructure-http-client';

const http = createHttpClient(fetch);
const tickets = await http.getJson('/api/events/demo/tickets', { parse: parseTicketList, signal });
```

The planned request accepts an optional `AbortSignal`, throws `HttpError` for a non-2xx response and propagates network and abort errors.
