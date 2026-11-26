<script setup lang="ts">
import { usePaletteStatus } from './usePaletteStatus.ts';

const { statusMessage } = usePaletteStatus();
</script>

<template>
  <div role="status">{{ statusMessage }}</div>
</template>
