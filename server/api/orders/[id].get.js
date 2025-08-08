export default defineEventHandler(async (event) => {
  const orderId = getRouterParam(event, 'id')
  const config = useRuntimeConfig()
  
  const SHOPIFY_DOMAIN = config.public.shopifyDomain
  const ACCESS_TOKEN = config.shopifyAccessToken

  try {
    const response = await $fetch(`https://${SHOPIFY_DOMAIN}/admin/api/2024-07/orders/${orderId}.json`, {
      headers: {
        'X-Shopify-Access-Token': ACCESS_TOKEN,
        'Content-Type': 'application/json'
      }
    })

    return response.order
  } catch (error) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Order not found'
    })
  }
})