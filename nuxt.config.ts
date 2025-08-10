export default defineNuxtConfig({
  // Configure for AWS Amplify with proper preset
  nitro: {
    preset: 'aws-amplify',
    // Add error handling
    errorHandler: '~/error.vue',
    // Ensure compatibility
    experimental: {
      payloadExtraction: false
    }
  },
  
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt'
  ],
  
  runtimeConfig: {
    // Server-side only
    shopifyAccessToken: process.env.SHOPIFY_ACCESS_TOKEN,
    
    // Public (client-side)
    public: {
      shopifyDomain: process.env.SHOPIFY_DOMAIN,
      shopifyStorefrontToken: process.env.SHOPIFY_STOREFRONT_TOKEN,
      shopifyApiVersion: process.env.SHOPIFY_API_VERSION || '2025-07'
    }
  },
  
  css: ['~/assets/css/main.css'],
  
  // Ensure SSR is properly configured
  ssr: true,
  
  // Add error handling
  app: {
    head: {
      title: 'Order Management System',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' }
      ]
    }
  },
  
  // Route rules for better Amplify compatibility
  routeRules: {
    // All routes should be server-side rendered
    '/**': { prerender: false, ssr: true },
    // API routes
    '/api/**': { cors: true }
  }
})