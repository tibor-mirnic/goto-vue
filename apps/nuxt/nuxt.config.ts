import { defineNuxtConfig } from 'nuxt/config';

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  css: ['@goto/domain-palette/style.css'],
  routeRules: { '/': { redirect: '/palette' } }
});
