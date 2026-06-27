import { defineConfig } from '@pandacss/dev';

// Panda CSS runs via the CLI (panda codegen && panda cssgen) and emits a
// standalone styled-system/styles.css — kept OUT of the PostCSS pipeline so it
// never fights Tailwind. preflight is off so Panda does not reset anything the
// existing Tailwind base layer already owns.
export default defineConfig({
  preflight: false,
  include: ['./src/**/*.{ts,tsx,js,jsx}'],
  exclude: [],
  outdir: 'styled-system',
  // Rename Panda's cascade layers so its `@layer base` doesn't collide with
  // Tailwind's reserved `base` layer when Next runs every CSS file through the
  // same PostCSS (tailwindcss) pipeline.
  layers: {
    reset: 'pd-reset',
    base: 'pd-base',
    tokens: 'pd-tokens',
    recipes: 'pd-recipes',
    utilities: 'pd-utilities',
  },
  theme: {
    extend: {
      tokens: {
        colors: {
          forest: { value: '#0A3D2B' },
          emerald: { value: '#1A6B4A' },
          gold: { value: '#B8892A' },
          goldLight: { value: '#E8C57A' },
          parchment: { value: '#F4EFE4' },
          ink: { value: '#0E1912' },
        },
      },
    },
  },
});
