export default defineNuxtConfig({
  devtools: { enabled: true },
  compatibilityDate: '2025-08-07',
  devServer: {
    host: '0.0.0.0',
    port: 3000
  },
  modules: [
    '@nuxtjs/tailwindcss'
  ],
  runtimeConfig: {
    shopifyAccessToken: process.env.SHOPIFY_ACCESS_TOKEN,
    public: {
      shopifyDomain: process.env.SHOPIFY_DOMAIN,
      shopifyStorefrontToken: process.env.SHOPIFY_STOREFRONT_TOKEN,
      shopifyApiVersion: process.env.SHOPIFY_API_VERSION || '2025-07'
    }
  },
  css: ['~/assets/css/main.css']
})
