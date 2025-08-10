export default defineNuxtConfig({
  // Configure for AWS Amplify
  nitro: {
    preset: 'aws-amplify'
  },
  
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt'
  ],
  
  runtimeConfig: {
    shopifyAccessToken: process.env.SHOPIFY_ACCESS_TOKEN,
    public: {
      shopifyDomain: process.env.SHOPIFY_DOMAIN,
      shopifyStorefrontToken: process.env.SHOPIFY_STOREFRONT_TOKEN,
      shopifyApiVersion: process.env.SHOPIFY_API_VERSION || '2025-07'
    }
  },
  
  css: ['~/assets/css/main.css'],
  
  // Ensure SSR is enabled for Amplify
  ssr: true
})