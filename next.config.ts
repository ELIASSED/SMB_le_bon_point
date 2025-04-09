// next.config.ts
import type { NextConfig } from 'next';
import type { WebpackConfigContext } from 'next/dist/server/config-shared';

const nextConfig: NextConfig = {
    webpack: (config: Configuration, { isServer }: WebpackConfigContext) => {    // Ignorer les fichiers .map
    config.module.rules.push({
      test: /\.js\.map$/,
      use: 'ignore-loader',
    });

    // Exclure chrome-aws-lambda ou @sparticuz/chromium du bundle côté serveur
    if (isServer) {
      config.externals.push('@sparticuz/chromium');
    }

    return config;
  },
  experimental: {
    serverComponentsExternalPackages: ['@sparticuz/chromium', 'puppeteer-core'],
  },
};

export default nextConfig;