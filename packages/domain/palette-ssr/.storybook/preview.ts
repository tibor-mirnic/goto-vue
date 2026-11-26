/// <reference types="vite-plus/client" />
import { setup } from '@storybook/vue3-vite';
import { themedPreview } from '../../../../tooling/storybook/preview.ts';
import '../src/style.scss';

// Docs can mount several Vue apps in one document.
setup((app, context) => {
  app.config.idPrefix = context?.id;
});

const preview = { ...themedPreview };

export default preview;
