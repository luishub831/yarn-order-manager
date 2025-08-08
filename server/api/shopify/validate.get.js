// server/api/shopify/validate.get.js
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  
  const SHOPIFY_DOMAIN = config.public.shopifyDomain
  const ACCESS_TOKEN = config.shopifyAccessToken
  const API_VERSION = config.public.shopifyApiVersion || '2025-07'

  // Check if we have the required configuration
  if (!SHOPIFY_DOMAIN || !ACCESS_TOKEN) {
    return {
      valid: false,
      error: 'Missing Shopify configuration. Please check your environment variables.',
      missing: {
        domain: !SHOPIFY_DOMAIN,
        accessToken: !ACCESS_TOKEN
      }
    }
  }

  try {
    // Test connection by fetching shop info
    const response = await $fetch(`https://${SHOPIFY_DOMAIN}/admin/api/${API_VERSION}/shop.json`, {
      headers: {
        'X-Shopify-Access-Token': ACCESS_TOKEN,
        'Content-Type': 'application/json'
      }
    })

    return {
      valid: true,
      shop: {
        name: response.shop.name,
        domain: response.shop.domain,
        email: response.shop.email
      },
      apiVersion: API_VERSION,
      domain: SHOPIFY_DOMAIN
    }
  } catch (error) {
    console.error('Shopify validation error:', error)
    
    let errorMessage = 'Failed to connect to Shopify'
    
    if (error.statusCode === 401) {
      errorMessage = 'Invalid Shopify access token'
    } else if (error.statusCode === 404) {
      errorMessage = 'Shopify store not found. Check your domain.'
    } else if (error.statusCode === 429) {
      errorMessage = 'Too many requests. Please try again later.'
    }

    return {
      valid: false,
      error: errorMessage,
      statusCode: error.statusCode
    }
  }
})