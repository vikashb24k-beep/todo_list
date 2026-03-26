/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        heading: ["Poppins", "sans-serif"],
        body: ["Manrope", "sans-serif"],
      },
      boxShadow: {
        card: "0 10px 35px -18px rgba(30, 41, 59, 0.45)",
      },
    },
  },
  plugins: [],
};
