/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
    'node_modules/flowbite-vue/**/*.{js,jsx,ts,tsx}',
  ],
  darkMode: 'class', // Enable dark mode with class strategy
  theme: {
    extend: {
      height: {
        'screen-50': '50vh', // Define 'screen-50' to be 50% of viewport height
        'screen-40': '40vh',
        'screen-35': '35vh',
        'screen-30': '30vh',
        'screen-20': '20vh',
        'screen-10': '10vh',
      },
    },
  },
  plugins: [require('flowbite/plugin')],
}