import { createApp } from 'vue';
import App from './App.vue';
import { router } from './router';

if (import.meta.env.DEV && __ENABLE_MOCK_API__) {
  const { enablePaletteMocks } = await import('./mock-api.ts');
  await enablePaletteMocks();
}

const app = createApp(App);

app.use(router);

app.mount('#app');
