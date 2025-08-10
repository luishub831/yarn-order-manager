// server/api/health.get.js
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  
  return {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: {
      nodeVersion: process.version,
      platform: process.platform,
      memoryUsage: process.memoryUsage(),
      environment: process.env.NODE_ENV || 'unknown'
    },
    shopify: {
      hasDomain: !!config.public.shopifyDomain,
      hasAccessToken: !!config.shopifyAccessToken,
      domain: config.public.shopifyDomain,
      apiVersion: config.public.shopifyApiVersion
    },
    amplify: {
      preset: 'aws-amplify',
      region: process.env.AWS_REGION || 'unknown',
      runtime: 'nitro'
    }
  }
})