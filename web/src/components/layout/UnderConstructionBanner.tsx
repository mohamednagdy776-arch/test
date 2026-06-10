'use client';
import { useState, useEffect } from 'react';

// Site-wide notice that the platform is still being built.
export const UnderConstructionBanner = () => {
  const [hidden, setHidden] = useState(false);

  // Remember dismissal for the browser session only.
  useEffect(() => {
    if (typeof window !== 'undefined' && sessionStorage.getItem('uc-banner-hidden') === '1') {
      setHidden(true);
    }
  }, []);

  if (hidden) return null;

  return (
    <div
      role="status"
      className="relative z-[100] w-full bg-green-600 text-white text-center text-xs sm:text-sm font-semibold py-2 px-8 shadow-sm"
    >
      🚧 هذا الموقع قيد الإنشاء حالياً — قد تواجه بعض الميزات غير المكتملة · Website under construction 🚧
      <button
        aria-label="إخفاء"
        onClick={() => {
          setHidden(true);
          try { sessionStorage.setItem('uc-banner-hidden', '1'); } catch {}
        }}
        className="absolute top-1/2 -translate-y-1/2 right-3 h-6 w-6 rounded-full hover:bg-green-700/60 transition-colors flex items-center justify-center"
      >
        ✕
      </button>
    </div>
  );
};
