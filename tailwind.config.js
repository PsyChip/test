/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./*.{js,html}"
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Fira Sans', 'sans-serif'],
        'condensed': ['Fira Sans Condensed', 'sans-serif'],
      },
      borderRadius: {
        'sm': '1px',
        'DEFAULT': '2px',
        'md': '3px',
        'lg': '3px',
        'xl': '3px',
        '2xl': '3px',
        '3xl': '3px',
        'full': '9999px',
      },
      colors: {
        red: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        }
      }
    },
  },
  plugins: [],
}