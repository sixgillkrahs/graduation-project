// tailwind.config.js
const { heroui } = require("@heroui/theme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./node_modules/@heroui/theme/dist/components/(avatar|badge|button|checkbox|divider|dropdown|form|image|input|link|menu|modal|pagination|popover|toggle|table|tabs|toast|user|ripple|spinner|spacer).js",
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
