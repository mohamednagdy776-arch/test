import * as stylex from '@stylexjs/stylex';

// StyleX style definitions live in a dedicated *.stylex.ts module so the StyleX
// PostCSS plugin only has to parse this small file (the plugin's parser doesn't
// handle the heavy TS/TSX in page.tsx). page.tsx imports `sx` and applies it
// with stylex.props() at runtime.
export const sx = stylex.create({
  goldRule: {
    height: '3px',
    width: '72px',
    borderRadius: '9999px',
    marginLeft: 'auto',
    marginRight: 'auto',
    backgroundImage:
      'linear-gradient(90deg, rgba(184,137,42,0), #B8892A 35%, #E8C57A 50%, #B8892A 65%, rgba(184,137,42,0))',
  },
  stxTag: {
    fontSize: '10px',
    fontWeight: 700,
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    color: '#66756A',
  },
});
