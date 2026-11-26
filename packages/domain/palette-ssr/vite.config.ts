import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite-plus';

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: { index: 'src/index.ts' },
      formats: ['es']
    },
    rolldownOptions: { external: ['vue'] }
  },
  run: {
    tasks: {
      // The compiler reads templates and imported types outside Vite Task's input tracking.
      'vue:typecheck': {
        command: 'node ../../../tooling/vue-tsc.cjs -p tsconfig.vue.json',
        cache: false
      },
      declarations: {
        command: 'node ../../../tooling/vue-tsc.cjs -p tsconfig.build.json',
        cache: false
      }
    }
  }
});
