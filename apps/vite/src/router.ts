import { createRouter, createWebHistory } from 'vue-router';

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/palette' },
    { path: '/palette', component: () => import('./routes/public/PaletteRoute.vue') }
  ]
});
