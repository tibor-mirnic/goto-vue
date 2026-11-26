import { defineNuxtConfig } from 'nuxt/config';

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  features: { inlineStyles: false },
  routeRules: { '/': { redirect: '/palette' } }
});
