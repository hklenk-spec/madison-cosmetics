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
      }
    },
  },
  plugins: [],
}
