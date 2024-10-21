/** @type {import('tailwindcss').Config} */
module.exports = {
  daisyui: {
    themes: ["light", "dark", "cupcake", "garden", "emerald"],
  },
  content: ["./src/views/**/*.ejs", "./src/views/*.ejs"],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
};
