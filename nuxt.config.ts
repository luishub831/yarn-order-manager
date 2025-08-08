export default defineNuxtConfig({
  devtools: { enabled: false },
  
  // Configure for Amplify with Node 18 compatibility
  nitro: {
    preset: 'aws-amplify',
    // Compatibility settings for Node 18
    minify: false,
    experimental: {
      wasm: false
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
      environment: process.env.NODE_ENV || 'production'
    }
  },
  
  css: ['~/assets/css/main.css'],
  
  // SSR configuration
  ssr: true,
  
  // Vite configuration for Node 18 compatibility
  vite: {
    define: {
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false
    }
  },
  
  // Compatibility date for older Node versions
  compatibilityDate: '2024-07-30',
  
  // Build configuration
  build: {
    transpile: ['@nuxtjs/tailwindcss']
  }
})