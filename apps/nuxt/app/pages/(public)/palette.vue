<script setup lang="ts">
import { PaletteModule } from '@goto/domain-palette';
import paletteStylesheet from '@goto/domain-palette/style.css?url&no-inline';

useHead({ link: [{ key: 'palette-stylesheet', rel: 'stylesheet', href: paletteStylesheet }] });
</script>

<template>
  <PaletteModule />
</template>
