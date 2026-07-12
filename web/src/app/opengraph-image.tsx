import { ImageResponse } from 'next/og';

// The site never had ANY og:image (no logo/banner asset exists anywhere in
// the repo, and `openGraph` in layout.tsx had no `images` field at all), so
// social platforms fell back to scraping a random <img> off the page --
// or nothing -- instead of a proper branded preview (#283). Next.js
// auto-detects this file convention and wires up og:image for every route.
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #213448 0%, #547792 55%, #94B4C1 100%)',
        }}
      >
        <div style={{ fontSize: 140, fontWeight: 700, color: '#ffffff' }}>طيبت</div>
        <div style={{ fontSize: 36, color: '#D4E8EE', marginTop: 12 }}>
          منصة التوافق الذكي والزواج الإسلامي
        </div>
      </div>
    ),
    { ...size },
  );
}
