import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { type ComponentOptions, h, reactive } from 'vue';
import type { PaletteName, PaletteResult } from '../../api/palettes/palettes.api.models.ts';
import PePaletteSsrViewer from './PePaletteSsrViewer.vue';
import type { PaletteViewerProps } from './palette-viewer.models.ts';
import { providePaletteSsrViewer } from './palette-viewer.provider.ts';

const exampleResults = {
  aurora: { palette: 'aurora', colors: ['indigo', 'harbor blue'] },
  mist: { palette: 'mist', colors: [] }
} as const satisfies Record<PaletteName, PaletteResult>;

const renderViewer = (selectedPalette: PaletteName, status: PaletteViewerProps['status']) => () => ({
  setup: () => {
    const state = reactive({
      selectedPalette,
      status,
      result: status === 'ready' ? exampleResults[selectedPalette] : null
    });
    const select = (palette: PaletteName) => {
      state.selectedPalette = palette;
      state.result = exampleResults[palette];
      state.status = 'ready';
    };

    providePaletteSsrViewer(state, select, () => select(state.selectedPalette));
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
          'PePaletteSsrPage provides the selected palette, request status and result to the viewer during setup. Each story uses the same provider and owns its own state. The examples handle selection and retry using local palette data.'
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
