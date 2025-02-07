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
      }
    },
  },
  plugins: [],
}

