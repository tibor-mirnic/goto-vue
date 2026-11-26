<script setup lang="ts">
import { toRef } from 'vue';
import type { PaletteName } from '../../api/palette.models.ts';
import { PePaletteSsrViewer, providePaletteSsrViewer } from '../../features/index.ts';
import type { PaletteViewerState } from '../../features/palette-ssr-viewer/paletteViewer.models.ts';

const props = defineProps<{ state: PaletteViewerState }>();
const emit = defineEmits<{ select: [palette: PaletteName]; retry: [] }>();

providePaletteSsrViewer({
  state: toRef(() => props.state),
  select: (palette) => emit('select', palette),
  retry: () => emit('retry')
});
</script>

<template>
  <main class="pe-palette-ssr-page">
    <h1>Palettes</h1>
    <PePaletteSsrViewer />
  </main>
</template>
