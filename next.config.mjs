/** @type {import('next').NextConfig} */
const nextConfig = {
  // Bake server-only API keys into the Lambda bundle at build time.
  // Amplify exposes env vars during `npm run build` but not always at Lambda runtime.
  // These are only imported by server-side API routes, so they won't reach the client bundle.
  env: {
    PPLX_API_KEY: process.env.PPLX_API_KEY,
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;
