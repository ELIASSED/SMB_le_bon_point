// next.config.js

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ajoutez un slash final à chaque route pour la compatibilité avec GitHub Pages
  trailingSlash: true,

  // Activez l'exportation statique
  output: 'export',

  // Autres configurations Next.js si nécessaire
};

export default nextConfig;
