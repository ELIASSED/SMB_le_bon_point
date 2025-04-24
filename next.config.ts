// next.config.ts
import type { NextConfig } from 'next';
import type { WebpackConfigContext } from 'next/dist/server/config-shared';
import type { Configuration } from 'webpack';

const nextConfig: NextConfig = {
  webpack: (config: Configuration, { isServer }: WebpackConfigContext) => {
    // S'assurer que config.module existe
    if (!config.module) {
      config.module = {};
    }
    if (!config.module.rules) {
      config.module.rules = [];
    }

    // Ignorer les fichiers .map
    config.module.rules.push({
      test: /\.js\.map$/,
      use: 'ignore-loader',
    });

    // Gérer handlebars pour éviter l'avertissement require.extensions
    config.module.rules.push({
      test: /handlebars[\\/]lib[\\/]index\.js$/, // Chemin plus précis
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env'],
          sourceType: 'unambiguous', // Gère les modules ESM/CommonJS
        },
      },
    });

    // Exclure @sparticuz/chromium du bundle côté serveur
    if (isServer) {
      if (!Array.isArray(config.externals)) {
        config.externals = config.externals ? [config.externals] : [];
      }
      (config.externals as string[]).push('@sparticuz/chromium');
    }

    return config;
  },
  experimental: {
    serverComponentsExternalPackages: ['@sparticuz/chromium', 'puppeteer-core', 'resend'],

  },
};

export default nextConfig;