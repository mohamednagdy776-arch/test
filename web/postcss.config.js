// StyleX runs as a PostCSS plugin (no Babel/SWC surgery), placed before
// Tailwind. useCSSLayers keeps StyleX output in its own cascade layer so it
// coexists cleanly with Tailwind + Flowbite + daisyUI.
module.exports = {
  plugins: {
    '@stylexjs/postcss-plugin': {
      // Only scan dedicated *.stylex.ts modules — the plugin's parser can't
      // handle the heavy TS in app/component files, and stylex.create only
      // lives in these modules anyway.
      include: ['./src/**/*.stylex.{js,jsx,ts,tsx}'],
      useCSSLayers: true,
    },
    tailwindcss: {},
    autoprefixer: {},
  },
};
