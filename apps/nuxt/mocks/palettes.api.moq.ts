import { getResponse } from 'msw';
import type { RequestEvent } from 'nuxt/schema';
import { createPaletteHandlers } from '@goto/domain-palette/moq';

export const paletteMockHandler = ({ req: request }: RequestEvent) => {
  if (request.method !== 'GET') return;

  const { origin } = new URL(request.url);
  return getResponse(createPaletteHandlers(origin), request);
};
