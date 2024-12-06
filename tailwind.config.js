// tailwind.config.js
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./pages/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#CCA900', // Couleur primaire (jaune doré)
        text: '#333333',    // Couleur du texte (gris foncé)
      },
    },
  },
  plugins: [],
}
