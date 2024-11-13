import { colors } from './src/styles/colors'
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/app/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: colors
    },
  },
  plugins: [],
}

