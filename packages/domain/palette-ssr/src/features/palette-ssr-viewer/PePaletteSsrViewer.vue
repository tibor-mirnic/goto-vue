<script setup lang="ts">
import PePaletteSsrColorList from './color-list/PePaletteSsrColorList.vue';
import PePaletteSsrPicker from './picker/PePaletteSsrPicker.vue';
import PePaletteSsrRetry from './retry/PePaletteSsrRetry.vue';
import PePaletteSsrStatus from './status/PePaletteSsrStatus.vue';
</script>

<template>
  <div class="pe-palette-ssr-viewer">
    <PePaletteSsrPicker />
    <PePaletteSsrStatus />
    <PePaletteSsrRetry />
    <PePaletteSsrColorList />
  </div>
</template>
