/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        charcoal: { DEFAULT: '#111111', 800: '#1a1a1a', 700: '#262626' },
        amber: { DEFAULT: '#D97706', 600: '#B45309', 500: '#D97706', 400: '#F59E0B' },
        offwhite: '#FAFAF9',
      },
      fontFamily: {
        display: ['"Bebas Neue"', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      maxWidth: { content: '1200px' },
    },
  },
  plugins: [],
}