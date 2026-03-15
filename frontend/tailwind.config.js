/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: { 50: '#fef7ee', 100: '#fdedd6', 200: '#fad7ac', 300: '#f6ba77', 400: '#f19340', 500: '#ed751a', 600: '#de5b10', 700: '#b84410', 800: '#933615', 900: '#772f14', 950: '#401509' },
        accent: { 50: '#f0fdf6', 100: '#dcfceb', 200: '#bbf7d6', 300: '#86efb4', 400: '#4ade8c', 500: '#22c55e', 600: '#16a34a', 700: '#15803d', 800: '#166534', 900: '#14532d', 950: '#052e16' },
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'system-ui', 'sans-serif'],
      },
      animation: {
        'match-pop': 'matchPop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'swipe-left': 'swipeLeft 0.3s ease-out forwards',
        'swipe-right': 'swipeRight 0.3s ease-out forwards',
      },
      keyframes: {
        matchPop: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '50%': { transform: 'scale(1.05)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        swipeLeft: {
          '100%': { transform: 'translateX(-120%) rotate(-15deg)', opacity: '0' },
        },
        swipeRight: {
          '100%': { transform: 'translateX(120%) rotate(15deg)', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
};
