/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config, { isServer }) => {
      // Ignorer les fichiers .map
      config.module.rules.push({
        test: /\.js\.map$/,
        use: 'ignore-loader',
      });
  
      // Exclure chrome-aws-lambda du bundle côté serveur
      if (isServer) {
        config.externals.push('chrome-aws-lambda');
      }
  
      return config;
    },
    // Autres options Next.js si nécessaire
    reactStrictMode: true,
  };
  
  module.exports = nextConfig;