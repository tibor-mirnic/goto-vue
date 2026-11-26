<script setup lang="ts">
import { UiButton } from '@goto/infrastructure-ui';
import { usePaletteViewer } from '../paletteViewer.provider.ts';

const { state, retry } = usePaletteViewer();
</script>

<template>
  <UiButton v-if="state.status === 'error'" class="pe-palette-viewer__retry" @click="retry">Retry</UiButton>
</template>
