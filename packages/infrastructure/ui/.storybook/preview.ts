/// <reference types="vite-plus/client" />
import type { Preview } from '@storybook/vue3-vite';
import { applyPreviewTheme, createDocsRenderer, watchSystemTheme } from './theme.ts';

import '../src/scss/default.scss';
import './preview.css';

const preview: Preview = {
  tags: ['autodocs'],
  globalTypes: {
    theme: {
      description: 'Canvas and Docs theme',
      toolbar: {
        title: 'Theme',
        icon: 'paintbrush',
        dynamicTitle: true,
        items: [
          { value: 'system', title: 'System' },
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' }
        ]
      }
    }
  },
  beforeAll: watchSystemTheme,
  initialGlobals: { theme: 'system' },
  decorators: [
    (story, { globals }) => {
      applyPreviewTheme(globals.theme);
      return story();
    }
  ],
  parameters: {
    docs: { renderer: createDocsRenderer },
    backgrounds: { disable: true },
    options: { storySort: { order: ['Styleguide', ['About'], 'Components'] } },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i
      }
    }
  }
};

export default preview;
