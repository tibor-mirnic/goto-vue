import { defineNuxtConfig } from 'nuxt/config';
import { addDevServerHandler, addNitroPlugin, createResolver, defineNuxtModule } from 'nuxt/kit';

const paletteMocks = defineNuxtModule({
  setup: async (_options, nuxt) => {
    if (!nuxt.options.dev || process.env.ENABLE_MOCK_API !== 'true') return;

    const { paletteClientMockHandler } = await import('./mocks/paletteApiClient.moq.ts');
    addDevServerHandler({ route: '/api/palettes', handler: { nuxt: paletteClientMockHandler } });
    addNitroPlugin(createResolver(import.meta.url).resolve('./server/mocks/paletteApiServer.moq.ts'));
  }
});

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  features: { inlineStyles: false },
  routeRules: { '/': { redirect: '/palette' } },
  modules: [paletteMocks]
});
