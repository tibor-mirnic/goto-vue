import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite-plus';

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: { index: 'entry.js' },
      formats: ['es'],
      cssFileName: 'style'
    },
    rolldownOptions: { external: ['vue'] }
  },
  run: {
    tasks: {
      // The compiler reads templates and imported types outside Vite Task's input tracking.
      'vue:typecheck': {
        command: 'node ../../../tooling/vueTsc.cjs -p tsconfig.vue.json',
        cache: false
      },
      declarations: {
        command: 'node ../../../tooling/vueTsc.cjs -p tsconfig.build.json',
        cache: false
      }
    }
  }
});
