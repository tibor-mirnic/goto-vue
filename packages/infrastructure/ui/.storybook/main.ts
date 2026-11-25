import type { StorybookConfig } from '@storybook/vue3-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: ['@storybook/addon-docs'],
  framework: {
    name: '@storybook/vue3-vite',
    options: {
      // Stories describe native attributes, slots and the model explicitly.
      docgen: false,
      builder: { viteConfigPath: import.meta.dirname + '/vite.config.ts' }
    }
  }
};
export default config;
