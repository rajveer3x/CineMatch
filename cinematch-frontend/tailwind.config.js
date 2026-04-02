/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        background: '#121222',
        surface: '#121222',
        'surface-container-low': '#1a1a2b',
        'surface-container-high': '#29283a',
        'surface-container-highest': '#333345',
        'surface-variant': '#333345',
        primary: '#ffc174',
        'primary-container': '#f59e0b',
        'on-primary': '#472a00',
        secondary: '#d2bbff',
        'secondary-container': '#6001d1',
        'on-secondary': '#3f008e',
        'on-surface': '#e3e0f8',
        'on-surface-variant': '#d8c3ad',
        'outline-variant': '#534434',
        error: '#ffb4ab',
      },
      fontFamily: {
        newsreader: ['Newsreader', 'serif'],
        manrope: ['Manrope', 'sans-serif'],
      },
      backgroundImage: {
        'primary-gradient': 'linear-gradient(135deg, #ffc174 0%, #f59e0b 100%)',
      }
    },
  },
  plugins: [],
}
