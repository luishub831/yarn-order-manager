// server/api/orders/verify/[id].get.js
export default defineEventHandler(async (event) => {
  const orderId = getRouterParam(event, 'id')
  const config = useRuntimeConfig()
  
  const SHOPIFY_DOMAIN = config.public.shopifyDomain
  const ACCESS_TOKEN = config.shopifyAccessToken
  const API_VERSION = config.public.shopifyApiVersion || '2025-07'

  console.log("=== VERIFYING ORDER ===")
  console.log("Order ID:", orderId)

  if (!SHOPIFY_DOMAIN || !ACCESS_TOKEN) {
    return {
      success: false,
      message: 'No Shopify configuration available',
      mockMode: true
    }
  }

  try {
    // Get the current order
    const orderResponse = await $fetch(`https://${SHOPIFY_DOMAIN}/admin/api/${API_VERSION}/orders/${orderId}.json`, {
      headers: {
        'X-Shopify-Access-Token': ACCESS_TOKEN,
        'Content-Type': 'application/json'
      }
    })

    const order = orderResponse.order

    // Get order metafields
    const metafieldsResponse = await $fetch(`https://${SHOPIFY_DOMAIN}/admin/api/${API_VERSION}/orders/${orderId}/metafields.json`, {
      headers: {
        'X-Shopify-Access-Token': ACCESS_TOKEN,
        'Content-Type': 'application/json'
      }
    })
    console.log('metafieldsResponse:', metafieldsResponse)

    const verification = {
      orderId: order.id,
      orderName: order.name,
      fulfillmentStatus: order.fulfillment_status,
      financialStatus: order.financial_status,
      closedAt: order.closed_at,
      cancelledAt: order.cancelled_at,
      canModify: !order.fulfillment_status && !order.closed_at && !order.cancelled_at,
      lineItems: order.line_items.map(item => ({
        id: item.id,
        title: item.title,
        sku: item.sku,
        quantity: item.quantity,
        fulfillmentStatus: item.fulfillment_status,
        properties: item.properties || [],
        propertiesCount: (item.properties || []).length
      })),
      metafields: metafieldsResponse.metafields?.map(mf => ({
        id: mf.id,
        namespace: mf.namespace,
        key: mf.key,
        type: mf.type,
        value: mf.value
      })) || [],
      lineItemMetafields: metafieldsResponse.metafields?.filter(mf => 
        mf.namespace === 'line_items'
      ) || []
    }

    console.log("Order verification complete")
    console.log("Can modify order:", verification.canModify)
    console.log("Line items with properties:", verification.lineItems.filter(item => item.properties.length > 0).length)
    console.log("Line item metafields:", verification.lineItemMetafields.length)

    return {
      success: true,
      verification
    }

  } catch (error) {
    console.error('Error verifying order:', error)
    
    return {
      success: false,
      error: error.message || 'Failed to verify order',
      statusCode: error.statusCode || 500
    }
  }
})