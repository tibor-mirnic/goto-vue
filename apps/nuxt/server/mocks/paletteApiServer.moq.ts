import { createPaletteHandlers } from '@goto/domain-palette/moq';
import { setupServer } from 'msw/node';
import { paletteApiOrigin } from '../utils/paletteApiOrigin.ts';

export default defineNitroPlugin((nitroApp) => {
  const server = setupServer(...createPaletteHandlers(new URL(paletteApiOrigin).origin));
  server.listen({ onUnhandledFrame: 'bypass' });
  nitroApp.hooks.hook('close', () => server.close());
});
