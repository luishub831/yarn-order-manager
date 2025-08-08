export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { orderNumber } = body
    const config = useRuntimeConfig()
    
    const SHOPIFY_DOMAIN = config.public.shopifyDomain
    const ACCESS_TOKEN = config.shopifyAccessToken
    const API_VERSION = config.public.shopifyApiVersion || '2025-07'
    
    console.log("=== SEARCH ORDER WITH ENHANCED PROPERTIES ===")
    console.log("Order Number:", orderNumber)
    console.log("Shopify Domain:", SHOPIFY_DOMAIN)
    console.log("Access Token exists:", !!ACCESS_TOKEN)

    if (!orderNumber) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Order number is required'
      })
    }

    // Check if we have the required config
    if (!SHOPIFY_DOMAIN || !ACCESS_TOKEN) {
      console.log("Missing Shopify config, returning mock data for testing")
      
      // Return mock data for testing when no config
      if (orderNumber === '123') {
        return {
          id: 123,
          name: '#123',
          order_number: 123,
          created_at: '2024-08-04T10:30:00Z',
          total_price: '549.98',
          fulfillment_status: 'processing',
          customer: {
            first_name: 'Test',
            last_name: 'Customer',
            email: 'test@example.com'
          },
          line_items: [
            {
              id: 1,
              title: '"Design Your Own" UPF50+ Unisex Polo Shirt',
              sku: 'SPOL-CRP-U-CYO-5XL',
              quantity: 1,
              price: '45.00',
              variant_title: '5XL',
              properties: [
                { name: 'upload-artwork', value: 'https://example.com/artwork1' },
                { name: 'upload-left-chest', value: 'https://example.com/left-chest1' },
                { name: 'upload-right-chest', value: '' },
                { name: 'upload-back-chest', value: 'https://example.com/back-chest1' },
                { name: 'artist', value: 'Amy Kilby' }
              ]
            }
          ]
        }
      } else {
        throw createError({
          statusCode: 404,
          statusMessage: `Order ${orderNumber} not found`
        })
      }
    }

    console.log("Searching for order in Shopify...")

    let order = null

    // Try to get order by name first
    try {
      const ordersResponse = await $fetch(`https://${SHOPIFY_DOMAIN}/admin/api/${API_VERSION}/orders.json`, {
        headers: {
          'X-Shopify-Access-Token': ACCESS_TOKEN,
          'Content-Type': 'application/json'
        },
        query: {
          name: `#${orderNumber}`,
          status: 'any',
          limit: 1
        }
      })

      if (ordersResponse.orders && ordersResponse.orders.length > 0) {
        order = ordersResponse.orders[0]
        console.log("Order found by name")
      }
    } catch (searchError) {
      console.log("Search by name failed:", searchError.message)
    }

    // If not found by name, try by ID
    if (!order && !isNaN(orderNumber)) {
      try {
        const orderResponse = await $fetch(`https://${SHOPIFY_DOMAIN}/admin/api/${API_VERSION}/orders/${orderNumber}.json`, {
          headers: {
            'X-Shopify-Access-Token': ACCESS_TOKEN,
            'Content-Type': 'application/json'
          }
        })
        order = orderResponse.order
        console.log("Order found by ID")
      } catch (idError) {
        console.log("Search by ID failed:", idError.message)
      }
    }

    if (!order) {
      throw createError({
        statusCode: 404,
        statusMessage: `Order ${orderNumber} not found`
      })
    }

    console.log(`Order found: ${order.name} with ${order.line_items.length} line items`)

    // Get metafields for this order
    console.log("Fetching order metafields...")
    let metafields = []
    try {
      const metafieldsResponse = await $fetch(`https://${SHOPIFY_DOMAIN}/admin/api/${API_VERSION}/orders/${order.id}/metafields.json`, {
        headers: {
          'X-Shopify-Access-Token': ACCESS_TOKEN,
          'Content-Type': 'application/json'
        }
      })
      metafields = metafieldsResponse.metafields || []
      console.log(`Found ${metafields.length} metafields`)
    } catch (metafieldsError) {
      console.log("Failed to fetch metafields:", metafieldsError.message)
    }

    // Filter line item metafields
    const lineItemMetafields = metafields.filter(mf => mf.namespace === 'line_items')
    console.log(`Found ${lineItemMetafields.length} line item metafields`)

    // Enhance line items with metafield properties
    const enhancedLineItems = order.line_items.map(lineItem => {
      console.log(`Processing line item ${lineItem.id}`)
      
      // Get metafields for this specific line item
      const itemMetafields = lineItemMetafields.filter(mf => 
        mf.key.startsWith(`line_item_${lineItem.id}_`)
      )
      
      console.log(`Line item ${lineItem.id} has ${itemMetafields.length} metafields`)

      // Create a map of metafield properties
      const metafieldProperties = {}
      itemMetafields.forEach(mf => {
        const propertyName = mf.key.replace(`line_item_${lineItem.id}_`, '')
        metafieldProperties[propertyName] = mf.value
      })

      // Get existing properties from the line item
      const existingProperties = lineItem.properties || []
      const existingPropertyNames = existingProperties.map(p => p.name)

      // Merge properties: prioritize line item properties, add metafield properties that don't exist
      const mergedProperties = [...existingProperties]

      // Add metafield properties that aren't already in line item properties
      Object.entries(metafieldProperties).forEach(([name, value]) => {
        if (!existingPropertyNames.includes(name)) {
          mergedProperties.push({ name, value })
        } else {
          // Update existing property value if metafield has newer data
          const existingProp = mergedProperties.find(p => p.name === name)
          if (existingProp && value && value !== existingProp.value) {
            console.log(`Updating property ${name} from metafield: ${existingProp.value} -> ${value}`)
            existingProp.value = value
          }
        }
      })

      console.log(`Line item ${lineItem.id} final properties:`, mergedProperties.map(p => p.name))

      return {
        ...lineItem,
        properties: mergedProperties,
        _metafieldProperties: metafieldProperties, // Debug info
        _originalProperties: existingProperties // Debug info
      }
    })

    const enhancedOrder = {
      ...order,
      line_items: enhancedLineItems
    }

    console.log("Order enhancement complete")

    return enhancedOrder

  } catch (error) {
    console.error("Search API Error:", error)
    
    if (error.statusCode) {
      throw error
    }
    
    // Handle Shopify API errors
    if (error.response) {
      console.error("Shopify API Error Response:", error.response)
      if (error.response.status === 401) {
        throw createError({
          statusCode: 401,
          statusMessage: 'Invalid Shopify access token'
        })
      }
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch order data: ' + error.message
    })
  }
})