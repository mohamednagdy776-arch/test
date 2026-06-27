// StyleX needs its Babel transform to compile `stylex.create` away (the PostCSS
// plugin only emits the CSS). next/babel keeps full Next.js + TS + JSX support;
// the app doesn't use next/font, so dropping SWC here is safe.
//
// Critically, we pin preset-env to MODERN targets. With no target, next/babel
// down-levels everything (unicode-property regex, class private methods, async
// regenerator) which breaks unrelated app files and deps. Modern targets skip
// all that — Babel only strips types, compiles JSX, and runs StyleX.
//
// runtimeInjection is off because @stylexjs/postcss-plugin generates the sheet.
module.exports = {
  presets: [
    [
      'next/babel',
      {
        'preset-env': {
          targets: { esmodules: true },
          // Don't down-level modern syntax the app already relies on — these
          // transforms break unrelated app files/deps under Babel (SWC handled
          // them natively). Excluding them keeps async + modern regex intact.
          exclude: [
            'transform-unicode-property-regex',
            'transform-unicode-regex',
            'transform-unicode-sets-regex',
            'transform-dotall-regex',
            'transform-named-capturing-groups-regex',
            'transform-regenerator',
          ],
        },
      },
    ],
  ],
  plugins: [
    // Needed for Babel to PARSE modern class private syntax some deps ship
    // (parse-level requirement, independent of the modern targets above).
    '@babel/plugin-transform-class-properties',
    '@babel/plugin-transform-private-methods',
    '@babel/plugin-transform-private-property-in-object',
    [
      '@stylexjs/babel-plugin',
      {
        dev: process.env.NODE_ENV !== 'production',
        runtimeInjection: false,
        treeshakeCompensation: true,
        unstable_moduleResolution: { type: 'commonJS', rootDir: __dirname },
      },
    ],
  ],
};
