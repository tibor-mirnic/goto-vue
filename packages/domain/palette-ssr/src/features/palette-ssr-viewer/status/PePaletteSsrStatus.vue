<script setup lang="ts">
import { usePaletteSsrStatus } from './usePaletteSsrStatus.ts';

const { statusMessage } = usePaletteSsrStatus();
</script>

<template>
  <div role="status">{{ statusMessage }}</div>
</template>
