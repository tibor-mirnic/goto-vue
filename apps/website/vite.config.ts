import { defineConfig } from 'vite-plus';

export default defineConfig({
  run: {
    tasks: {
      // The native TypeScript compiler's source and declaration reads can escape automatic tracking.
      typecheck: { command: 'tsc', cache: false }
    }
  }
});
