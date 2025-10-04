// // frontend/tailwind.config.js
// /** @type {import('tailwindcss').Config} */
// export default {
//   content: [
//     "./index.html",
//     "./src/**/*.{js,ts,jsx,tsx}",
//   ],
//   theme: {
//     extend: {
//       colors: {
//         'primary-blue': '#1e3a8a', 
//         'secondary-gray': '#f4f7f9', 
//         'accent-teal': '#14b8a6', 
//       },
//       fontFamily: {
//         sans: ['Inter', 'sans-serif'], 
//       },
//       boxShadow: {
//         'smooth': '0 4px 12px rgba(0, 0, 0, 0.08)',
//         'elevate': '0 10px 25px rgba(0, 0, 0, 0.15)',
//       }
//     },
//   },
//   plugins: [],
// }

// frontend/tailwind.config.js

// /** @type {import('tailwindcss').Config} */
// export default {
//   content: [
//     // This array tells Tailwind which files to scan for classes
//     "./index.html",
//     "./src/**/*.{js,ts,jsx,tsx}",
//   ],
//   theme: {
//     extend: {
//       // --- CUSTOM COLORS AND SHADOWS DEFINED HERE ---
//       colors: {
//         'primary-blue': '#1e3a8a', 
//         'secondary-gray': '#f4f7f9', // The background color
//         'accent-teal': '#14b8a6', 
//       },
//       boxShadow: {
//         // Defining custom shadows used in the dashboard cards
//         'smooth': '0 4px 12px rgba(0, 0, 0, 0.08)',
//         'elevate': '0 10px 25px rgba(0, 0, 0, 0.15)',
//         '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.15)', // Ensures deeper shadow works
//       }
//       // ---------------------------------------------
//     },
//   },
//   plugins: [],
// }

// frontend/tailwind.config.js

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  // --- CRITICAL: Enable dark mode via class ---
  darkMode: 'class',
  // ------------------------------------------
  theme: {
    extend: {
      colors: {
        'primary-blue': '#1e3a8a', 
        'secondary-gray': '#f4f7f9', 
        'accent-teal': '#14b8a6', 
      },
      boxShadow: {
        'smooth': '0 4px 12px rgba(0, 0, 0, 0.08)',
        'elevate': '0 10px 25px rgba(0, 0, 0, 0.15)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
      }
    },
  },
  plugins: [],
}