// server/api/health.get.js
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  
  return {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    deployment: {
      stage: config.public.deploymentStage,
      buildTime: config.public.buildTime,
      apiVersion: config.public.shopifyApiVersion
    },
    environment: {
      hasShopifyDomain: !!config.public.shopifyDomain,
      hasAccessToken: !!config.shopifyAccessToken,
      hasStorefrontToken: !!config.public.shopifyStorefrontToken,
      shopifyDomain: config.public.shopifyDomain ? 
        config.public.shopifyDomain.replace(/^https?:\/\//, '') : 'NOT_SET'
    },
    amplify: {
      ready: true,
      nitroPreset: 'aws-amplify'
    }
  }
})