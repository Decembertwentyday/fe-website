const { withSentryConfig } = require('@sentry/nextjs');

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {},
  reactStrictMode: true,
  output: 'standalone',
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  webpack(config, { isServer }) {
    config.module.rules.push({
      test: /\.svg$/i,
      use: ['@svgr/webpack'],
    });
    config.resolve.fallback = { fs: false, net: false, tls: false };

    return config;
  },
  async rewrites() {
    return [
      {
        source: '/api-goerli/:path*',
        destination: 'http://3.233.81.38:3002/:path*',
      },
      {
        source: '/api/:path*',
        destination: 'https://www.etch.market/api/:path*',
      },
      {
        source: '/api-release/:path*',
        destination: 'https://api.orbitrum.io/:path*',
      },
    ];
  },
};

const sentryConfig = withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/
  silent: true,
  org: 'etchmarket',
  project: 'etchmarket-nextjs',
  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Transpiles SDK to be compatible with IE11 (increases bundle size)
  transpileClientSDK: true,

  // Routes browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers (increases server load)
  tunnelRoute: '/monitoring',

  // Hides source maps from generated client bundles
  hideSourceMaps: true,

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,
  autoInstrumentServerFunctions: false,
});

module.exports = process.env.NODE_ENV == 'development' ? nextConfig : sentryConfig;
