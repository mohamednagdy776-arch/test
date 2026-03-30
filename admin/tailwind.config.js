/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#1a56db',
        danger: '#e02424',
        success: '#057a55',
      },
    },
  },
  plugins: [],
};
