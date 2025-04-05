/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    webpack: (config: any) => {
      // Désactiver les modules Node.js non nécessaires pour handlebars/puppeteer
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false, // Désactive fs, souvent utilisé par handlebars
        path: false, // Désactive path, parfois requis par puppeteer
        os: false, // Désactive os, pour éviter des dépendances inutiles
      };
  
      // Ignorer les avertissements spécifiques à require.extensions
      config.ignoreWarnings = [
        {
          module: /handlebars/,
          message: /require\.extensions/,
        },
      ];
  
      return config;
    },
  };
  
  export default nextConfig;