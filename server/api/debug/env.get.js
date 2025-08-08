// server/api/debug/env.get.js
// This endpoint helps debug environment variable issues
// Remove this file in production!

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  
  return {
    environment: process.env.NODE_ENV,
    publicConfig: {
      shopifyDomain: config.public.shopifyDomain,
      shopifyApiVersion: config.public.shopifyApiVersion,
      shopifyStorefrontToken: config.public.shopifyStorefrontToken ? '[SET]' : '[NOT SET]'
    },
    privateConfig: {
      shopifyAccessToken: config.shopifyAccessToken ? '[SET]' : '[NOT SET]'
    },
    rawEnv: {
      SHOPIFY_DOMAIN: process.env.SHOPIFY_DOMAIN ? '[SET]' : '[NOT SET]',
      SHOPIFY_ACCESS_TOKEN: process.env.SHOPIFY_ACCESS_TOKEN ? '[SET]' : '[NOT SET]',
      SHOPIFY_STOREFRONT_TOKEN: process.env.SHOPIFY_STOREFRONT_TOKEN ? '[SET]' : '[NOT SET]',
      SHOPIFY_API_VERSION: process.env.SHOPIFY_API_VERSION || '[NOT SET]'
    }
  }
})