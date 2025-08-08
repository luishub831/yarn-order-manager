export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { orderId, lineItemId, properties } = body
    const config = useRuntimeConfig()
    
    const SHOPIFY_DOMAIN = config.public.shopifyDomain
    const ACCESS_TOKEN = config.shopifyAccessToken
    const API_VERSION = config.public.shopifyApiVersion || '2025-07'

    console.log("=== UPDATING LINE ITEM PROPERTIES (METAFIELDS ONLY) ===")
    console.log("Order ID:", orderId)
    console.log("Line Item ID:", lineItemId)
    console.log("Properties to update:", JSON.stringify(properties, null, 2))

    if (!orderId || !lineItemId || !properties) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required fields'
      })
    }

    if (!SHOPIFY_DOMAIN || !ACCESS_TOKEN) {
      console.log("Missing Shopify config, simulating update")
      await new Promise(resolve => setTimeout(resolve, 500))
      return { 
        success: true, 
        message: 'Line item properties updated successfully (mock mode)'
      }
    }

    console.log("=== UPDATING METAFIELDS ===")
    
    // Get existing metafields for this line item
    const existingMetafields = await $fetch(`https://${SHOPIFY_DOMAIN}/admin/api/${API_VERSION}/orders/${orderId}/metafields.json`, {
      headers: {
        'X-Shopify-Access-Token': ACCESS_TOKEN,
        'Content-Type': 'application/json'
      }
    })

    const lineItemMetafields = existingMetafields.metafields?.filter(mf => 
      mf.namespace === 'line_items' && mf.key.startsWith(`line_item_${lineItemId}_`)
    ) || []

    console.log(`Found ${lineItemMetafields.length} existing metafields for line item ${lineItemId}`)

    const metafieldUpdates = []
    const propertyNames = properties.map(p => p.name)

    // Step 1: Update/Create metafields for provided properties
    for (const prop of properties) {
      const metafieldKey = `line_item_${lineItemId}_${prop.name}`
      const existingMetafield = lineItemMetafields.find(mf => mf.key === metafieldKey)

      try {
        if (existingMetafield) {
          console.log(`Updating metafield: ${metafieldKey}`)
          
          const updateResponse = await $fetch(`https://${SHOPIFY_DOMAIN}/admin/api/${API_VERSION}/orders/${orderId}/metafields/${existingMetafield.id}.json`, {
            method: 'PUT',
            headers: {
              'X-Shopify-Access-Token': ACCESS_TOKEN,
              'Content-Type': 'application/json'
            },
            body: {
              metafield: {
                id: existingMetafield.id,
                value: prop.value || ''
              }
            }
          })
          
          metafieldUpdates.push({ 
            action: 'updated', 
            key: metafieldKey, 
            id: existingMetafield.id,
            value: prop.value || ''
          })
        } else {
          console.log(`Creating metafield: ${metafieldKey}`)
          
          const createResponse = await $fetch(`https://${SHOPIFY_DOMAIN}/admin/api/${API_VERSION}/orders/${orderId}/metafields.json`, {
            method: 'POST',
            headers: {
              'X-Shopify-Access-Token': ACCESS_TOKEN,
              'Content-Type': 'application/json'
            },
            body: {
              metafield: {
                namespace: 'line_items',
                key: metafieldKey,
                value: prop.value || '',
                type: 'single_line_text_field'
              }
            }
          })
          
          metafieldUpdates.push({ 
            action: 'created', 
            key: metafieldKey, 
            id: createResponse.metafield.id,
            value: prop.value || ''
          })
        }
      } catch (metafieldError) {
        console.error(`Error with metafield ${metafieldKey}:`, metafieldError.message)
        metafieldUpdates.push({ 
          action: 'error', 
          key: metafieldKey, 
          error: metafieldError.message 
        })
      }
    }

    // Step 2: Delete metafields for properties that are no longer in the list
    const metafieldsToDelete = lineItemMetafields.filter(mf => {
      const propertyName = mf.key.replace(`line_item_${lineItemId}_`, '')
      return !propertyNames.includes(propertyName)
    })

    console.log(`Deleting ${metafieldsToDelete.length} obsolete metafields`)

    for (const metafield of metafieldsToDelete) {
      try {
        await $fetch(`https://${SHOPIFY_DOMAIN}/admin/api/${API_VERSION}/orders/${orderId}/metafields/${metafield.id}.json`, {
          method: 'DELETE',
          headers: {
            'X-Shopify-Access-Token': ACCESS_TOKEN,
            'Content-Type': 'application/json'
          }
        })
        
        console.log(`Deleted metafield: ${metafield.key}`)
        metafieldUpdates.push({ 
          action: 'deleted', 
          key: metafield.key, 
          id: metafield.id 
        })
      } catch (deleteError) {
        console.error(`Error deleting metafield ${metafield.key}:`, deleteError.message)
        metafieldUpdates.push({ 
          action: 'delete_error', 
          key: metafield.key, 
          error: deleteError.message 
        })
      }
    }

    console.log("All metafield operations completed:", metafieldUpdates)

    const successfulUpdates = metafieldUpdates.filter(u => 
      ['created', 'updated', 'deleted'].includes(u.action)
    )

    return {
      success: true,
      message: `Line item properties updated successfully (${successfulUpdates.length} operations)`,
      method: 'metafields_only',
      updates: metafieldUpdates,
      summary: {
        created: metafieldUpdates.filter(u => u.action === 'created').length,
        updated: metafieldUpdates.filter(u => u.action === 'updated').length,
        deleted: metafieldUpdates.filter(u => u.action === 'deleted').length,
        errors: metafieldUpdates.filter(u => u.action.includes('error')).length
      }
    }

  } catch (error) {
    console.error('=== UPDATE FAILED ===')
    console.error('Error:', error.message)
    
    if (error.response?.data) {
      console.error('Shopify error details:', JSON.stringify(error.response.data, null, 2))
    }
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update line item properties: ' + error.message
    })
  }
})