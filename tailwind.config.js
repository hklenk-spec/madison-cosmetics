/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        madison: {
          gold: '#A47E3C',
          dark: '#111111',
          charcoal: '#212934',
          alabaster: '#FAF9F6',
          muted: '#6E7A8A',
        }
      },
      fontFamily: {
        zilla: ['"Zilla Slab"', 'serif'],
        open: ['"Open Sans"', 'sans-serif'],
      },
      keyframes: {
        'slide-down': {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'slide-down': 'slide-down 0.25s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
      },
    },
  },
  plugins: [],
}
