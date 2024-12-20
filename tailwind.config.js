/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter var', 'sans-serif'],
      },
      colors: {
        'background-color': '#FFF0F5',
        'primary-color': '#FF69B4',
        'secondary-color': '#FFB6C1',
        'text-color': '#333333',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}

