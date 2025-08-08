export default defineNuxtConfig({
  devtools: { enabled: false }, // Disable in production
  
  // Configure for Amplify deployment
  nitro: {
    preset: 'aws-amplify'
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
      environment: process.env.NODE_ENV || 'production'
    }
  },
  
  css: ['~/assets/css/main.css'],
  
  // SSR configuration
  ssr: true,
  
  // Compatibility
  compatibilityDate: '2024-07-30'
})