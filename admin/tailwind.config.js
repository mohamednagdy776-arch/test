/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        navy:        { DEFAULT: '#213448', light: '#547792', dark: '#131F2E' },
        slate:       '#547792',
        mist:        '#94B4C1',
        sand:        '#EAE0CF',
        cream:       '#FDFAF5',
        'deep-navy': '#131F2E',
        fog:         '#C8D8DF',
        'warm-gray': '#BFB9AD',
        highlight:   '#D4E8EE',
        success:     '#4A8C6F',
        warning:     '#C9923A',
        error:       '#B05252',
        primary: {
          DEFAULT: '#213448',
          foreground: '#FDFAF5',
          hover: '#131F2E',
        },
        secondary: {
          DEFAULT: '#94B4C1',
          foreground: '#213448',
        },
        accent: {
          DEFAULT: '#547792',
          foreground: '#FDFAF5',
        },
        muted: {
          DEFAULT: '#EAE0CF',
          foreground: '#BFB9AD',
        },
        background: '#EAE0CF',
        foreground: '#131F2E',
        border: '#C8D8DF',
        input: '#C8D8DF',
        ring: '#547792',
        destructive: {
          DEFAULT: '#B05252',
          foreground: '#FDFAF5',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      borderRadius: {
        lg: '0.75rem',
        xl: '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        soft: '0 2px 15px -3px rgba(33,52,72,0.1), 0 10px 20px -2px rgba(33,52,72,0.06)',
        card: '0 2px 12px rgba(33,52,72,0.08)',
        'card-hover': '0 10px 25px -5px rgba(33,52,72,0.12), 0 8px 10px -6px rgba(33,52,72,0.06)',
        elevated: 'rgba(33,52,72,0.2) 0px 30px 45px -20px, rgba(19,31,46,0.1) 0px 18px 36px -14px',
        glow: '0 0 20px rgba(84,119,146,0.15)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
      },
    },
  },
  plugins: [],
};
