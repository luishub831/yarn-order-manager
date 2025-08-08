// composables/useShopify.js
export const useShopify = () => {
  const config = useRuntimeConfig()

  /**
   * Search for orders by calling our server API endpoint
   * @param {string} orderNumber - Order number to search for
   * @returns {Promise<Object>} Order data
   */
  const searchOrderByNumber = async (orderNumber) => {
    try {
      if (!orderNumber || orderNumber.trim() === '') {
        throw new Error('Order number is required')
      }

      // Call our server API endpoint instead of direct Shopify API
      const response = await $fetch('/api/orders/search', {
        method: 'POST',
        body: {
          orderNumber: orderNumber.trim()
        }
      })

      return response
    } catch (error) {
      console.error('Error searching for order:', error)
      
      // Handle specific error types
      if (error.statusCode === 404) {
        throw new Error(`Order ${orderNumber} not found`)
      } else if (error.statusCode === 401) {
        throw new Error('Invalid Shopify credentials. Please check your configuration.')
      } else if (error.statusCode === 429) {
        throw new Error('Too many requests. Please try again later.')
      }
      
      throw new Error(error.data?.message || error.message || 'Failed to fetch order data')
    }
  }

  /**
   * Get order details by ID
   * @param {string|number} orderId - Order ID
   * @returns {Promise<Object>} Detailed order data
   */
  const getOrderDetails = async (orderId) => {
    try {
      const response = await $fetch(`/api/orders/${orderId}`)
      return response
    } catch (error) {
      console.error('Error fetching order details:', error)
      
      if (error.statusCode === 404) {
        throw new Error('Order not found')
      }
      
      throw new Error('Failed to fetch order details')
    }
  }

  /**
   * Update line item properties
   * @param {number} orderId - Order ID
   * @param {number} lineItemId - Line item ID
   * @param {Array} properties - Array of property objects {name, value}
   * @returns {Promise<Object>} Success response
   */
  const updateLineItemProperties = async (orderId, lineItemId, properties) => {
    try {
      if (!orderId || !lineItemId || !properties) {
        throw new Error('Missing required parameters')
      }

      const response = await $fetch('/api/orders/update', {
        method: 'POST',
        body: {
          orderId,
          lineItemId,
          properties
        }
      })

      return response
    } catch (error) {
      console.error('Error updating line item properties:', error)
      throw new Error(error.data?.message || error.message || 'Failed to update line item properties')
    }
  }

  /**
   * Validate Shopify connection
   * @returns {Promise<Object>} Connection status
   */
  const validateConnection = async () => {
    try {
      const response = await $fetch('/api/shopify/validate')
      return response
    } catch (error) {
      return {
        valid: false,
        error: error.data?.message || error.message || 'Failed to validate connection'
      }
    }
  }

  /**
   * Search orders with advanced filters
   * @param {Object} filters - Search filters
   * @returns {Promise<Array>} Array of orders
   */
  const searchOrders = async (filters = {}) => {
    try {
      const response = await $fetch('/api/orders', {
        query: filters
      })
      return response
    } catch (error) {
      console.error('Error searching orders:', error)
      throw new Error('Failed to search orders')
    }
  }

  // Check if we have basic configuration
  const hasBasicConfig = !!(config.public.shopifyDomain)

  // Return all available methods
  return {
    // Main methods
    searchOrderByNumber,
    getOrderDetails,
    updateLineItemProperties,
    
    // Utility methods
    validateConnection,
    searchOrders,
    
    // Configuration
    config: {
      domain: config.public.shopifyDomain,
      apiVersion: config.public.shopifyApiVersion,
      hasCredentials: hasBasicConfig
    }
  }
}