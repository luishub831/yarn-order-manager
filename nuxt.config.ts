export default defineNuxtConfig({
  devtools: { enabled: false },
  
  // Simple Amplify configuration
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
      shopifyApiVersion: process.env.SHOPIFY_API_VERSION || '2025-07'
    }
  },
  
  css: ['~/assets/css/main.css'],
  
  // SSR configuration
  ssr: true
})