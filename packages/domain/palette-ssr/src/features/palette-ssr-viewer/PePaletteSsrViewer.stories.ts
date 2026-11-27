import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { type ComponentOptions, h, shallowRef } from 'vue';
import type { PaletteName } from '../../api/palette.models.ts';
import PePaletteSsrViewer from './PePaletteSsrViewer.vue';
import type { PaletteViewerState } from './paletteViewer.models.ts';
import { providePaletteSsrViewer } from './paletteViewer.provider.ts';

const exampleColors = {
  aurora: ['indigo', 'harbor blue'],
  mist: []
} as const satisfies Record<PaletteName, readonly string[]>;

const renderViewer = (palette: PaletteName, status: PaletteViewerState['status']) => () => ({
  setup: () => {
    const state = shallowRef<PaletteViewerState>(
      status === 'ready' ? { status, palette, colors: exampleColors[palette] } : { status, palette }
    );
    const select = (palette: PaletteName) => {
      state.value = { status: 'ready', palette, colors: exampleColors[palette] };
    };

    providePaletteSsrViewer({ state, select, retry: () => select(state.value.palette) });
    return () => h(PePaletteSsrViewer);
  }
});

const meta = {
  title: 'Palette SSR/Features/PePaletteSsrViewer',
  component: PePaletteSsrViewer as ComponentOptions,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'PePaletteSsrPage provides the host’s viewer state and forwards selection and retry events. Each story uses the same provider with local palette data.'
      }
    }
  }
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Ready: Story = {
  render: renderViewer('aurora', 'ready'),
  parameters: {
    docs: { description: { story: 'Aurora shows two colors. Select mist to see a successful empty result.' } }
  }
};

export const Empty: Story = {
  render: renderViewer('mist', 'ready'),
  parameters: {
    docs: { description: { story: 'Mist has no colors. Select aurora to show the color list.' } }
  }
};

export const Pending: Story = {
  render: renderViewer('aurora', 'pending'),
  parameters: {
    docs: { description: { story: 'The host is waiting for Aurora. Select mist to show the new selection’s result.' } }
  }
};

export const RetryAfterFailure: Story = {
  render: renderViewer('aurora', 'error'),
  parameters: {
    docs: { description: { story: 'Aurora failed to load. Click Retry to restore its ordered color list.' } }
  }
};
