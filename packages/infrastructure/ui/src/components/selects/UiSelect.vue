<script setup lang="ts">
import { useSelect } from './useSelect.ts';

defineProps<{ multiple?: false; value?: never }>();
const model = defineModel<string>({ required: true });
const { onChange } = useSelect(model);
</script>

<template>
  <select class="goto-ui-select" :value="model" @change="onChange">
    <slot />
  </select>
</template>
