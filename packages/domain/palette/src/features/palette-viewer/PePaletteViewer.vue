<script setup lang="ts">
import { computed } from 'vue';
import { usePaletteViewer } from './palette-viewer.provider.ts';

const { palettes, state, select, retry } = usePaletteViewer();
const selectedPalette = computed({
  get: () => (state.value.status === 'idle' ? '' : state.value.palette),
  set: (palette: string) => {
    void select(palette);
  }
});
</script>

<template>
  <div class="pe-palette-viewer">
    <label>
      Palette
      <select v-model="selectedPalette">
        <option value="" disabled>Choose a palette</option>
        <option v-for="palette in palettes" :key="palette" :value="palette">{{ palette }}</option>
      </select>
    </label>
    <div role="status">
      <template v-if="state.status === 'loading'">Loading {{ state.palette }}…</template>
      <template v-else-if="state.status === 'error'">Could not load {{ state.palette }}.</template>
      <template v-else-if="state.status === 'ready'">
        {{ state.colors.length ? 'Colors in ' + state.palette : 'No colors in ' + state.palette }}
      </template>
    </div>
    <button v-if="state.status === 'error'" type="button" @click="retry">Retry</button>
    <ul v-if="state.status === 'ready' && state.colors.length" aria-label="Colors">
      <li v-for="(color, index) in state.colors" :key="index">{{ color }}</li>
    </ul>
  </div>
</template>

<style scoped>
.pe-palette-viewer {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 0.75rem;
  min-width: 0;
  overflow-wrap: anywhere;
}

label {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 0.25rem;
}

select,
button {
  max-width: 100%;
  font: inherit;
}

button {
  justify-self: start;
}

ul {
  margin: 0;
  padding-inline-start: 1.5rem;
}
</style>
