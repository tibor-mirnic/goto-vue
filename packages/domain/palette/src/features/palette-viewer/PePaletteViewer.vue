<script setup lang="ts">
import { UiButton, UiLabel, UiSelect, UiUl } from '@goto/infrastructure-ui';
import { usePaletteViewerControls } from './usePaletteViewerControls.ts';

const { palettes, state, selectedPalette, retry } = usePaletteViewerControls();
</script>

<template>
  <div class="pe-palette-viewer">
    <UiLabel>
      Palette
      <UiSelect v-model="selectedPalette">
        <option value="" disabled :selected="selectedPalette === ''">Choose a palette</option>
        <option v-for="palette in palettes" :key="palette" :value="palette" :selected="selectedPalette === palette">
          {{ palette }}
        </option>
      </UiSelect>
    </UiLabel>
    <div role="status">
      <template v-if="state.status === 'loading'">Loading {{ state.palette }}…</template>
      <template v-else-if="state.status === 'error'">Could not load {{ state.palette }}.</template>
      <template v-else-if="state.status === 'ready'">
        {{ state.colors.length ? 'Colors in ' + state.palette : 'No colors in ' + state.palette }}
      </template>
    </div>
    <UiButton v-if="state.status === 'error'" class="pe-palette-viewer__retry" @click="retry">Retry</UiButton>
    <UiUl v-if="state.status === 'ready' && state.colors.length" aria-label="Colors">
      <li v-for="(color, index) in state.colors" :key="index">{{ color }}</li>
    </UiUl>
  </div>
</template>
