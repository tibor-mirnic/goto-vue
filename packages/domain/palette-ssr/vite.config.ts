import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite-plus';

const dependencyBuilds = [{ task: 'build', from: 'dependencies' as const }];

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: { index: 'src/index.ts', 'index.server': 'src/index.server.ts' },
      formats: ['es']
    },
    rolldownOptions: { external: ['vue', '@goto/infrastructure-ui'] }
  },
  run: {
    tasks: {
      unit: { command: 'vp test', dependsOn: ['build'] },
      // The compiler reads templates and imported types outside Vite Task's input tracking.
      'vue:typecheck': {
        command: 'node ../../../tooling/vue-tsc.cjs -p tsconfig.vue.json',
        cache: false,
        dependsOn: ['build']
      },
      declarations: {
        command: 'node ../../../tooling/vue-tsc.cjs -p tsconfig.build.json',
        cache: false,
        dependsOn: dependencyBuilds
      }
    }
  }
});
