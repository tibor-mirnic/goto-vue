<script setup lang="ts">
import { UiLabel, UiSelect } from '@goto/infrastructure-ui';
import { usePalettePicker } from './usePalettePicker.ts';

const { palettes, selectedPalette } = usePalettePicker();
</script>

<template>
  <UiLabel>
    Palette
    <UiSelect v-model="selectedPalette">
      <option value="" disabled :selected="selectedPalette === ''">Choose a palette</option>
      <option v-for="palette in palettes" :key="palette" :value="palette" :selected="selectedPalette === palette">
        {{ palette }}
      </option>
    </UiSelect>
  </UiLabel>
</template>
