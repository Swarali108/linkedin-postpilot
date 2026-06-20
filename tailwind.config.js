/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Friendlier, softer brand blue (kept the "linkedin" name for continuity).
        linkedin: {
          DEFAULT: "#2563eb",
          dark: "#1d4ed8",
          light: "#60a5fa",
        },
        mist: {
          50: "#f6f9fe",
          100: "#eef3fb",
          200: "#e2e9f5",
        },
      },
      boxShadow: {
        soft: "0 6px 24px -12px rgba(37, 99, 235, 0.18)",
      },
      borderRadius: {
        xl: "0.9rem",
        "2xl": "1.25rem",
        "3xl": "1.75rem",
      },
    },
  },
  plugins: [],
};
