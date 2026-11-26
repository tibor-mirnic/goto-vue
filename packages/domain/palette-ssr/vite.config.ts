import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite-plus';

const dependencyBuilds = [{ task: 'build', from: 'dependencies' as const }];

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: {
        index: 'entry.js',
        'index.server': 'src/api/server/index.ts'
      },
      formats: ['es'],
      cssFileName: 'style'
    },
    rolldownOptions: { external: ['vue', '@goto/infrastructure-ui'] }
  },
  run: {
    tasks: {
      storybook: { command: 'storybook dev -p 6008 --no-open', dependsOn: dependencyBuilds, cache: false },
      'build-storybook': { command: 'storybook build', dependsOn: dependencyBuilds, cache: false },
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
