<script setup lang="ts">
import { PePaletteSsrViewer, providePaletteSsrViewer } from '../../features/index.ts';
import { paletteViewerEmits, paletteViewerProps } from '../../features/palette-viewer/palette-viewer.models.ts';

const props = defineProps(paletteViewerProps);
const emit = defineEmits(paletteViewerEmits);

providePaletteSsrViewer(
  props,
  (palette) => emit('select', palette),
  () => emit('retry')
);
</script>

<template>
  <main class="pe-palette-ssr-page">
    <h1>Palettes</h1>
    <PePaletteSsrViewer />
  </main>
</template>
