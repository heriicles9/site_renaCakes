/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          brown: '#5D4037',
          pink: '#F8E7E7',
          rose: '#D88C9A',
          cream: '#FFFCF9',
        },
      },
      fontFamily: {
        heading: ['Playfair Display', 'serif'],
        body: ['Manrope', 'sans-serif'],
        accent: ['Dancing Script', 'cursive'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
