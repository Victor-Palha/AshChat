const { colors } = require('./src/styles/colors');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.tsx',
  ],
  theme: {
    extend: {
      colors: colors,
      fontFamily: {
        'kenia': ['Kenia', 'sans-serif'],
      },
      keyframes: {
        'rotate-shake': {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(10deg)' },
          '50%': { transform: 'rotate(-10deg)' },
          '75%': { transform: 'rotate(5deg)' },
        },
      },
      animation: {
        'rotate-shake': 'rotate-shake 1s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};