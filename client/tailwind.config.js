/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        spsu: {
          blue: '#0057B8',
          secondary: '#0076CE',
          navy: '#0B2545',
          lightBlue: '#EAF4FF',
          bgNeutral: '#F7F9FC',
          card: '#FFFFFF',
          accent: '#00A3E0',
          dark: '#081c34'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
