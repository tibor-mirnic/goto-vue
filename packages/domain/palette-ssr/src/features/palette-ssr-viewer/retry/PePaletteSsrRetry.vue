<script setup lang="ts">
import { UiButton } from '@goto/infrastructure-ui';
import { usePaletteSsrViewer } from '../paletteViewer.provider.ts';

const { state, retry } = usePaletteSsrViewer();
</script>

<template>
  <UiButton v-if="state.status === 'error'" class="pe-palette-ssr-viewer__retry" @click="retry">Retry</UiButton>
</template>
