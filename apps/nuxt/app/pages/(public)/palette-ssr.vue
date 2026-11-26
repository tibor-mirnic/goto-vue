<script setup lang="ts">
import { PePaletteSsrPage } from '@goto/domain-palette-ssr';
import paletteStylesheet from '@goto/domain-palette-ssr/style.css?url&no-inline';
import { usePaletteSsrRoute } from '~/features/public/palette-ssr/composables/usePaletteSsrRoute';

useHead({ link: [{ key: 'palette-stylesheet', rel: 'stylesheet', href: paletteStylesheet }] });

const { query, state, select, retry } = usePaletteSsrRoute();
await query;
</script>

<template>
  <PePaletteSsrPage :state="state" @select="select" @retry="retry" />
</template>
