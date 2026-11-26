<script setup lang="ts">
import PePaletteColorList from './color-list/PePaletteColorList.vue';
import PePalettePicker from './picker/PePalettePicker.vue';
import PePaletteRetry from './retry/PePaletteRetry.vue';
import PePaletteStatus from './status/PePaletteStatus.vue';
</script>

<template>
  <div class="pe-palette-viewer">
    <PePalettePicker />
    <PePaletteStatus />
    <PePaletteRetry />
    <PePaletteColorList />
  </div>
</template>
