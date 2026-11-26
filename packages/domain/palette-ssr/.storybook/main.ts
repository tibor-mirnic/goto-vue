import type { StorybookConfig } from '@storybook/vue3-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: ['@storybook/addon-docs'],
  framework: {
    name: '@storybook/vue3-vite',
    options: {
      docgen: false,
      builder: { viteConfigPath: import.meta.dirname + '/vite.config.ts' }
    }
  }
};
export default config;
