export default defineNuxtConfig({
  devtools: { enabled: process.env.NODE_ENV === 'development' },
  
  // Optimized for AWS Amplify with Node.js 22
  nitro: {
    preset: 'aws-amplify',
    // Leverage Node.js 22 performance features
    experimental: {
      wasm: true
    }
  },
  
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt'
  ],
  
  runtimeConfig: {
    // Private keys (server-side only)
    shopifyAccessToken: process.env.SHOPIFY_ACCESS_TOKEN,
    
    // Public keys (client-side)
    public: {
      shopifyDomain: process.env.SHOPIFY_DOMAIN,
      shopifyStorefrontToken: process.env.SHOPIFY_STOREFRONT_TOKEN,
      shopifyApiVersion: process.env.SHOPIFY_API_VERSION || '2025-07',
      environment: process.env.NODE_ENV || 'production',
      nodeVersion: process.version // For debugging
    }
  },
  
  css: ['~/assets/css/main.css'],
  
  // SSR configuration
  ssr: true,
  
  // Modern build configuration for Node.js 22
  build: {
    transpile: process.env.NODE_ENV === 'production' ? ['@nuxtjs/tailwindcss'] : []
  },
  
  // Vite configuration optimized for Node.js 22
  vite: {
    build: {
      target: 'node22',
      minify: 'esbuild'
    },
    optimizeDeps: {
      include: ['pinia']
    }
  },
  
  // Use latest compatibility features
  compatibilityDate: '2024-08-08'
})