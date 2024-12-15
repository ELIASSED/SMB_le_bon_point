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
        primary: '#0D3B66',   // Bleu profond, évoquant la confiance et le professionnalisme
        secondary: '#FAA916', // Jaune-orangé vif, attire l’attention sur les éléments clés
        accent: '#F4D35E',    // Doré doux, pour souligner subtilement les appels à l’action
        dark: '#1C1C1C',      // Gris très foncé, pour le texte principal et les titres
        light: '#F7F9FA',     // Blanc cassé, donne une impression de propreté et de modernité
        success: '#2BC16A',   // Vert franc et dynamique, pour valider les actions positives
        error: '#E63946',     // Rouge légèrement adouci, clair et directement compréhensible
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Merriweather', 'serif'],
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
