/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        linkedin: {
          DEFAULT: "#0a66c2",
          dark: "#004182",
          light: "#378fe9",
        },
      },
    },
  },
  plugins: [],
};
