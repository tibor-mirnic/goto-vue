/// <reference types="vite-plus/client" />
import type { Preview } from '@storybook/vue3-vite';
import { applyPreviewTheme, createDocsRenderer, watchSystemTheme } from './theme.ts';

import './preview.css';

export const themedPreview: Preview = {
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
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i
      }
    }
  }
};
