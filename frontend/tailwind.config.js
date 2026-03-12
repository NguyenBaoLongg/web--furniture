/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Manrope", "sans-serif"],
        display: ["Manrope", "sans-serif"],
      },
      colors: {
        primary: "#305050",
        "background-light": "#f6f7f7",
        "background-dark": "#161c1c",
      },
    },
  },
  plugins: [],
};
