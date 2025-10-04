// frontend/tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-blue': '#1e3a8a', 
        'secondary-gray': '#f4f7f9', 
        'accent-teal': '#14b8a6', 
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'], 
      },
      boxShadow: {
        'smooth': '0 4px 12px rgba(0, 0, 0, 0.08)',
        'elevate': '0 10px 25px rgba(0, 0, 0, 0.15)',
      }
    },
  },
  plugins: [],
}