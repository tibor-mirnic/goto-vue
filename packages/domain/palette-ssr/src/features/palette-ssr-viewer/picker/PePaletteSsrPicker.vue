<script setup lang="ts">
import { UiLabel, UiSelect } from '@goto/infrastructure-ui';
import { usePaletteSsrPicker } from './usePaletteSsrPicker.ts';

const { palettes, selectedPalette, selectId } = usePaletteSsrPicker();
</script>

<template>
  <UiLabel :for="selectId">
    Palette
    <UiSelect :id="selectId" v-model="selectedPalette">
      <option v-for="palette in palettes" :key="palette" :value="palette" :selected="selectedPalette === palette">
        {{ palette }}
      </option>
    </UiSelect>
  </UiLabel>
</template>
