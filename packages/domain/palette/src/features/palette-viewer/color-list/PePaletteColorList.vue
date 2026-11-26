<script setup lang="ts">
import { UiUl } from '@goto/infrastructure-ui';
import { usePaletteViewer } from '../paletteViewer.provider.ts';

const { state } = usePaletteViewer();
</script>

<template>
  <UiUl v-if="state.status === 'ready' && state.colors.length" aria-label="Colors">
    <li v-for="(color, index) in state.colors" :key="index">{{ color }}</li>
  </UiUl>
</template>
