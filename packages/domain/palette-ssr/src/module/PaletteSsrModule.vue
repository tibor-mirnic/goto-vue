<script setup lang="ts">
import { paletteViewerEmits, paletteViewerProps } from '../features/palette-viewer/palette-viewer.models.ts';
import PePaletteSsrPage from '../pages/palette-ssr/PePaletteSsrPage.vue';

const props = defineProps(paletteViewerProps);
const emit = defineEmits(paletteViewerEmits);
</script>

<template>
  <PePaletteSsrPage v-bind="props" @select="emit('select', $event)" @retry="emit('retry')" />
</template>
