/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0A192F',
          darker: '#050C16',
        },
        champagne: {
          DEFAULT: '#F1E5AC',
          muted: 'rgba(241, 229, 172, 0.2)',
        }
      },
      borderWidth: {
        'thin': '0.5px',
      }
    },
  },
  plugins: [],
}
