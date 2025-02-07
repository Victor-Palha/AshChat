const { colors } = require('./src/styles/colors');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [],
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

