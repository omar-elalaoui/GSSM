/** @type {import('tailwindcss').Config} */
module.exports = {
  content:
   ["./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    './node_modules/preline/preline.js',
  ],
  theme: {
    extend: {
      fontFamily: {
        Montserrat: "Montserrat",
      },
    },
  },
  plugins: [require("tailwind-scrollbar"), require('preline/plugin')],
};
