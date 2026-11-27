import vue from '@vitejs/plugin-vue';
import { type DepOptimizationOptions, type PluginOption, defineConfig } from 'vite-plus';

export default defineConfig(async ({ command, isPreview }) => {
  const enabled = command === 'serve' && !isPreview && process.env.ENABLE_MOCK_API === 'true';
  const plugins: PluginOption[] = [vue()];
  let optimizeDeps: DepOptimizationOptions | undefined;

  if (enabled) {
    const { msw } = await import('msw/vite');
    plugins.push(msw());
  } else {
    // The dependency scanner follows the guarded import even when the MSW plugin is off.
    optimizeDeps = { exclude: ['virtual:msw', '@goto/domain-palette/moq'] };
  }

  return {
    define: { __ENABLE_MOCK_API__: JSON.stringify(enabled) },
    plugins,
    optimizeDeps,
    server: {
      proxy: {
        '/api/': {
          target: process.env.API_URL ?? 'http://127.0.0.1:4000',
          changeOrigin: true
        }
      }
    },
    run: {
      tasks: {
        // The checker reads imported types and templates outside task input tracking.
        'vue:typecheck': {
          command: 'node ../../tooling/vueTsc.cjs -p tsconfig.vue.json',
          dependsOn: ['@goto/domain-palette#build'],
          cache: false
        }
      }
    }
  };
});
