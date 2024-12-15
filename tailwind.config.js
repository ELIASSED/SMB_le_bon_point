// tailwind.config.js

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,jsx,ts,tsx}",
    "./src/components/**/*.{js,jsx,ts,tsx}",
    "./src/pages/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#ffcf40',   // Jaune vif pour les éléments principaux et les appels à l'action
        secondary: '#000000', // Noir pour le texte principal et les titres
        accent: '#F5F5F5',    // Gris clair pour les arrière-plans secondaires et les bordures
        dark: '#000000',      // Noir pour le texte principal
        light: '#f5ebe4',     // Blanc pour les fonds
        success: '#28a745',   // Vert pour indiquer le succès
        error: '#dc3545',     // Rouge pour signaler les erreurs
      },
      fontFamily: {
        sans: ['Marianne', 'sans-serif'],  // Police officielle utilisée par le gouvernement français
        serif: ['Georgia', 'serif'],       // Police de secours pour les textes en serif
      },
      fontSize: {
        'xs': '.75rem',
        'sm': '.875rem',
        'base': '1rem',
        'lg': '1.125rem',
        'xl': '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
        '5xl': '3rem',
        '6xl': '4rem',
      },
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
      borderRadius: {
        'xl': '1rem',
      },
      boxShadow: {
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),      // Plugin pour styliser les formulaires
    require('@tailwindcss/typography'), // Plugin pour styliser le texte
  ],
}
