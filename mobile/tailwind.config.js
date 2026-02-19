/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        'artbloom-cream': '#F9F7F2',
        'artbloom-clay': '#E6D5B8',
        'artbloom-peach': '#eb7d4aff',
        'artbloom-charcoal': '#2C2C2C',
        'artbloom-brown': '#6B4C3E',
        'artbloom-gold': '#D4AF37',
      },
      fontFamily: {
        playfair: ['PlayfairDisplay_400Regular', 'serif'],
        sans: ['Inter_400Regular', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
