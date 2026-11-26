import type { Meta, StoryObj } from '@storybook/vue3-vite';
import type { ComponentOptions } from 'vue';
import PePaletteViewer from './PePaletteViewer.vue';
import { providePaletteViewer } from './paletteViewer.provider.ts';

const meta = {
  title: 'Palette/Features/PePaletteViewer',
  component: PePaletteViewer as ComponentOptions,
  decorators: [
    () => ({
      setup: () => {
        providePaletteViewer();
      },
      template: '<story />'
    })
  ],
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'PePalettePage calls providePaletteViewer() during setup and renders PePaletteViewer as its child. Each story uses the same provider. Choosing a palette requests /palettes/{name}.json. The host supplies an array of color names in display order. Switching palettes cancels the previous request.'
      },
      source: {
        language: 'vue',
        code: `<script setup lang="ts">
import { PePaletteViewer, providePaletteViewer } from '../../features/index.ts';

providePaletteViewer();
</script>

<template>
  <PePaletteViewer />
</template>`
      }
    }
  }
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const ChooseAPalette: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Choose aurora to see two colors, then choose mist to see how the viewer presents an empty palette.'
      }
    }
  }
};

export const Loaded: Story = {
  parameters: {
    docs: {
      story: { autoplay: true },
      description: { story: 'Aurora has two colors. Choose mist to switch to an empty palette.' }
    }
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.selectOptions(canvas.getByRole('combobox', { name: 'Palette' }), 'aurora');
    await canvas.findByRole('list', { name: 'Colors' });
  }
};

export const Empty: Story = {
  parameters: {
    docs: {
      story: { autoplay: true },
      description: { story: 'Mist loads successfully with no colors. Choose aurora to display the list again.' }
    }
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.selectOptions(canvas.getByRole('combobox', { name: 'Palette' }), 'mist');
    await canvas.findByText('No colors in mist');
  }
};

export const RetryAfterFailure: Story = {
  parameters: {
    docs: {
      story: { inline: false, height: '240px' },
      description: {
        story:
          'The first request for aurora receives an HTTP 503. Click Retry to request the same palette again and display its colors.'
      }
    }
  },
  play: async ({ canvas }) => {
    // Docs renders this example in its own iframe. Only the initial selection needs a failed response.
    const select = canvas.getByRole<HTMLSelectElement>('combobox', { name: 'Palette' });
    const fetchAsset = window.fetch;
    window.fetch = (input, init) =>
      input === '/palettes/aurora.json'
        ? Promise.resolve(new Response(null, { status: 503 }))
        : fetchAsset(input, init);
    try {
      select.value = 'aurora';
      select.dispatchEvent(new Event('change', { bubbles: true }));
    } finally {
      window.fetch = fetchAsset;
    }
    await canvas.findByRole('button', { name: 'Retry' });
  }
};
