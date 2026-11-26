import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite-plus';

export default defineConfig({
  plugins: [vue()],
  run: {
    tasks: {
      // The checker reads imported types and templates outside task input tracking.
      'vue:typecheck': { command: 'node ../../tooling/vue-tsc.cjs -p tsconfig.vue.json', cache: false }
    }
  }
});
