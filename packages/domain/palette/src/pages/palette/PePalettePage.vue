<script setup lang="ts">
import { PePaletteViewer, providePaletteViewer } from '../../features/index.ts';

providePaletteViewer();
</script>

<template>
  <main class="pe-palette-page">
    <h1>Palettes</h1>
    <PePaletteViewer />
  </main>
</template>
