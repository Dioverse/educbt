/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e0f7f7',
          100: '#cceeee',
          200: '#99cccc',
          300: '#b2d8d8',
          400: '#66b2b2',
          500: '#006f6f',
          600: '#007575',
          700: '#008080',
          800: '#006666',
          900: '#004c4c',
        },
      },
    },
  },
  plugins: [],
}