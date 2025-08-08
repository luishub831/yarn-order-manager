export default defineNuxtConfig({
  devtools: { enabled: true },
  
  // This configuration works for both local and Amplify
  nitro: {
    // Use Amplify preset for production, auto-detects local dev
    preset: process.env.NODE_ENV === 'production' ? 'aws-amplify' : undefined,
    
    // CORS settings that work in both environments
    routeRules: {
      '/api/**': {
        cors: true,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      }
    }
  },
  
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt'
  ],
  
  runtimeConfig: {
    // Private keys (server-side only) - works with both .env and Amplify env vars
    shopifyAccessToken: process.env.SHOPIFY_ACCESS_TOKEN,
    
    // Public keys (client-side) - works with both .env and Amplify env vars  
    public: {
      shopifyDomain: process.env.SHOPIFY_DOMAIN,
      shopifyStorefrontToken: process.env.SHOPIFY_STOREFRONT_TOKEN,
      shopifyApiVersion: process.env.SHOPIFY_API_VERSION || '2025-07',
      // Environment detection
      isProduction: process.env.NODE_ENV === 'production',
      environment: process.env.NODE_ENV || 'development'
    }
  },
  
  css: ['~/assets/css/main.css'],
  
  // SSR works in both environments
  ssr: true,
  
  // Build optimization
  build: {
    transpile: process.env.NODE_ENV === 'production' ? ['@nuxtjs/tailwindcss'] : []
  }
})