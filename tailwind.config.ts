import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef7f6",
          100: "#d5ecea",
          200: "#a9d8d4",
          300: "#74bdb7",
          400: "#469e98",
          500: "#2f857f",
          600: "#256a66",
          700: "#215552",
          800: "#1e4543",
          900: "#1c3b39",
        },
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
