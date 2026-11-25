/// <reference types="vite-plus/client" />
import type { Preview } from '@storybook/vue3-vite';
import { themedPreview } from '../../../../tooling/storybook/preview.ts';
import '../src/scss/default.scss';

const preview: Preview = {
  ...themedPreview,
  tags: ['autodocs'],
  parameters: {
    ...themedPreview.parameters,
    options: { storySort: { order: ['Styleguide', ['About'], 'Components'] } }
  }
};

export default preview;
