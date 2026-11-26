import { defineNuxtConfig } from 'nuxt/config';
import { addDevServerHandler, defineNuxtModule } from 'nuxt/kit';

const paletteMocks = defineNuxtModule({
  setup: async (_options, nuxt) => {
    if (!nuxt.options.dev || process.env.ENABLE_MOCK_API !== 'true') return;

    const { paletteMockHandler } = await import('./mocks/palettes.api.moq.ts');
    addDevServerHandler({ route: '/api/palettes', handler: { nuxt: paletteMockHandler } });
  }
});

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  features: { inlineStyles: false },
  routeRules: { '/': { redirect: '/palette' } },
  modules: [paletteMocks]
});
