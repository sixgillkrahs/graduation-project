// tailwind.config.js
const { heroui } = require("@heroui/theme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./node_modules/@heroui/theme/dist/components/(button|checkbox|divider|form|image|input|link|toggle|ripple|spinner).js",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#007AFF",
        black: "#1A1A1A",
      },
    },
  },
  darkMode: "class",
  plugins: [heroui()],
};
