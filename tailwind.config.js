const { designTokens } = require('./Theme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: designTokens.typography.fontFamily,
      fontSize: designTokens.typography.fontSize,
      lineHeight: designTokens.typography.lineHeight,
      spacing: designTokens.spacing,
      borderRadius: designTokens.borders.borderRadius,
      boxShadow: designTokens.shadows,
    },
  },
  plugins: [],
};