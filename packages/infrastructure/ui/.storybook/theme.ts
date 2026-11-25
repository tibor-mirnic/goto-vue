import type { DocsRenderer } from '@storybook/addon-docs';
import type { VueRenderer } from '@storybook/vue3-vite';
import { GLOBALS_UPDATED, SET_GLOBALS, UPDATE_GLOBALS } from 'storybook/internal/core-events';
import { addons } from 'storybook/preview-api';
import { themes } from 'storybook/theming';

const systemPreference = () => window.matchMedia('(prefers-color-scheme: dark)');

export const applyPreviewTheme = (theme: unknown) => {
  const root = document.documentElement;
  if (theme === 'light' || theme === 'dark') {
    root.dataset.gotoUiTheme = theme;
  } else {
    delete root.dataset.gotoUiTheme;
  }
};

export const watchSystemTheme = () => {
  const preference = systemPreference();
  const refresh = () => {
    if (!document.documentElement.dataset.gotoUiTheme) {
      // Storybook refreshes the active Docs page when it receives a globals update.
      addons.getChannel().emit(UPDATE_GLOBALS, { globals: {} });
    }
  };
  preference.addEventListener('change', refresh);
  return () => preference.removeEventListener('change', refresh);
};

export const createDocsRenderer = async (): Promise<DocsRenderer<VueRenderer>> => {
  const { DocsRenderer } = await import('@storybook/addon-docs');
  const renderer = new DocsRenderer<VueRenderer>();
  return {
    render: (context, parameters, element) => {
      const { channel } = context;
      const theme: unknown =
        channel.last(GLOBALS_UPDATED)?.[0]?.globals.theme ?? channel.last(SET_GLOBALS)?.[0]?.globals.theme;
      applyPreviewTheme(theme);
      const scheme = theme === 'light' || theme === 'dark' ? theme : systemPreference().matches ? 'dark' : 'light';
      return renderer.render(context, { ...parameters, theme: themes[scheme] }, element);
    },
    unmount: renderer.unmount
  };
};
