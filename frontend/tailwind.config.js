/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Vibrant modern curated color palette
        brand: {
          50: '#f5f7ff',
          100: '#ebf0ff',
          200: '#d6e0ff',
          300: '#adc2ff',
          400: '#7599ff',
          500: '#3b66ff',
          600: '#2544eb',
          700: '#1c31d6',
          800: '#1b29ad',
          900: '#1c268a',
        },
        slate: {
          950: '#0b0f19', // Premium extra dark blue-slate
        }
      },
      fontFamily: {
        sans: ['Inter', 'Outfit', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
