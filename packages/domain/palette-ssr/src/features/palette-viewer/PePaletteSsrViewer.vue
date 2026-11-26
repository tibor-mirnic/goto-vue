<script setup lang="ts">
import { UiButton, UiLabel, UiSelect, UiUl } from '@goto/infrastructure-ui';
import { usePaletteSsrViewerControls } from './composables/usePaletteSsrViewerControls.ts';

const { palettes, state, selectedPalette, selectId, retry } = usePaletteSsrViewerControls();
</script>

<template>
  <div class="pe-palette-ssr-viewer">
    <UiLabel :for="selectId">
      Palette
      <UiSelect :id="selectId" v-model="selectedPalette">
        <option v-for="palette in palettes" :key="palette" :value="palette" :selected="selectedPalette === palette">
          {{ palette }}
        </option>
      </UiSelect>
    </UiLabel>
    <div role="status">
      <template v-if="state.status === 'pending'">Loading {{ state.palette }}…</template>
      <template v-else-if="state.status === 'error'">Could not load {{ state.palette }}.</template>
      <template v-else>
        {{ state.colors.length ? 'Colors in ' + state.palette : 'No colors in ' + state.palette }}
      </template>
    </div>
    <UiButton v-if="state.status === 'error'" class="pe-palette-ssr-viewer__retry" @click="retry">Retry</UiButton>
    <UiUl v-if="state.status === 'ready' && state.colors.length" aria-label="Colors">
      <li v-for="(color, index) in state.colors" :key="index">{{ color }}</li>
    </UiUl>
  </div>
</template>
