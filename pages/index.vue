<template>
  <div class="order-management-container">
    <!-- Header Section -->
    <div class="header-section">
      <h1 class="main-title">Order Management System</h1>
      <div class="search-section">
        <input
          v-model="orderNumber"
          type="text"
          placeholder="Enter Order Number (e.g., 123, ORD-456)"
          class="order-input"
          @keyup.enter="searchOrder"
        />
        <button @click="searchOrder" class="search-button" :disabled="loading">
          <svg class="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m21 21-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
          {{ loading ? 'Searching...' : 'Search Order' }}
        </button>
      </div>
    </div>

    <!-- Welcome Message -->
    <div v-if="!orderData && !loading && !error" class="welcome-section">
      <h2 class="welcome-title">Welcome to Order Management</h2>
      <p class="welcome-text">Enter an order number above to view and manage line items</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-section">
      <div class="loading-spinner"></div>
      <p>{{ loadingMessage || 'Loading order details...' }}</p>
    </div>

    <!-- Error State -->
    <div v-if="error" class="error-section">
      <p class="error-message">{{ error }}</p>
      <button @click="clearError" class="retry-button">Try Again</button>
    </div>

    <!-- Order Details Section -->
    <div v-if="orderData" class="order-details-section">
      <div class="order-details-header">
        <h2>Order Details</h2>
      </div>
      
      <div class="order-info-grid">
        <div class="info-card">
          <label>Order Number:</label>
          <span>{{ orderData.name || orderData.order_number }}</span>
        </div>
        <div class="info-card">
          <label>Customer:</label>
          <span>{{ getCustomerName() }}</span>
        </div>
        <div class="info-card">
          <label>Order Date:</label>
          <span>{{ formatDate(orderData.created_at) }}</span>
        </div>
        <div class="info-card">
          <label>Status:</label>
          <span class="status-badge" :class="getStatusClass()">
            {{ orderData.fulfillment_status || 'PROCESSING' }}
          </span>
        </div>
        <div class="info-card">
          <label>Total Amount:</label>
          <span>${{ orderData.total_price || '0.00' }}</span>
        </div>
      </div>

      <!-- Order Line Items -->
      <div class="line-items-section">
        <h3>Order Line Items</h3>
        <div class="table-container">
          <table class="line-items-table">
            <thead>
              <tr>
                <th>ITEM ID</th>
                <th>PRODUCT NAME</th>
                <th>SIZE</th>
                <th>QUANTITY</th>
                <th>UNIT PRICE</th>
                <th>CUSTOM PROPERTIES</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in orderData.line_items" :key="item.id || index">
                <td>{{ item.sku || `TEMP-${String(index + 1).padStart(3, '0')}` }}</td>
                <td>{{ item.title || item.name }}</td>
                <td>{{ getItemSize(item) }}</td>
                <td>{{ item.quantity }}</td>
                <td>${{ item.price }}</td>
                <td>
                  <div class="custom-properties">
                    <!-- Display existing properties -->
                    <div 
                      v-for="property in getExistingProperties(item)" 
                      :key="property.name" 
                      class="property-row"
                    >
                      <label>{{ formatPropertyName(property.name) }}:</label>
                      <div class="property-value">
                        <input
                          v-if="isLinkProperty(property.name)"
                          v-model="property.value"
                          type="url"
                          :placeholder="`Enter ${formatPropertyName(property.name)} URL`"
                          class="property-input"
                          @blur="updatePropertyValue(item, property)"
                        />
                        <input
                          v-else
                          v-model="property.value"
                          type="text"
                          :placeholder="`Enter ${formatPropertyName(property.name)}`"
                          class="property-input"
                          @blur="updatePropertyValue(item, property)"
                        />
                        <button
                          @click="deleteProperty(item, property)"
                          class="delete-button"
                          :disabled="updatingProperties"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    
                    <!-- Add Property Button -->
                    <div class="add-property-section">
                      <button 
                        @click="openAddPropertyModal(item)" 
                        class="add-property-button"
                        :disabled="updatingProperties"
                      >
                        + Add Property
                      </button>
                    </div>
                  </div>
                </td>
                <td>
                  <span class="status-badge processing">PROCESSING</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Add Property Modal -->
    <div v-if="showAddPropertyModal" class="modal-overlay" @click="closeAddPropertyModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Add New Property</h3>
          <button @click="closeAddPropertyModal" class="modal-close">&times;</button>
        </div>
        
        <div class="modal-body">
          <div class="form-group">
            <label for="propertyName">Property Name:</label>
            <input
              id="propertyName"
              v-model="newProperty.name"
              type="text"
              placeholder="e.g., upload-artwork, custom-note"
              class="modal-input"
            />
          </div>
          
          <div class="form-group">
            <label for="propertyValue">Property Value:</label>
            <input
              id="propertyValue"
              v-model="newProperty.value"
              :type="newProperty.type === 'url' ? 'url' : 'text'"
              placeholder="Enter property value"
              class="modal-input"
            />
          </div>
          
          <div class="form-group">
            <label for="propertyType">Property Type:</label>
            <select
              id="propertyType"
              v-model="newProperty.type"
              class="modal-select"
            >
              <option value="text">Text</option>
              <option value="url">URL/Link</option>
            </select>
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="closeAddPropertyModal" class="modal-cancel-button">
            Cancel
          </button>
          <button 
            @click="addNewProperty" 
            class="modal-add-button"
            :disabled="!newProperty.name || addingProperty"
          >
            {{ addingProperty ? 'Adding...' : 'Add Property' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Success Message -->
    <div v-if="successMessage" class="success-message">
      {{ successMessage }}
    </div>
  </div>
</template>

<script setup>
// Demo data for testing without Shopify API
const getMockOrderData = (orderNum) => {
  if (orderNum === '123') {
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
            { name: 'upload-artwork', value: 'https://upload.cloudlift.app/s/yam-c' },
            { name: 'upload-left-chest', value: 'https://upload.cloudlift.app/s/yam-c' },
            { name: 'upload-right-chest', value: '' },
            { name: 'upload-back-chest', value: '' },
            { name: 'artist', value: '' }
          ]
        },
        {
          id: 2,
          title: '"Design Your Own" UPF50+ Unisex Polo Shirt',
          sku: 'SPOL-CRP-U-CYO-3XL',
          quantity: 1,
          price: '45.00',
          variant_title: '3XL',
          properties: [
            { name: 'upload-artwork', value: 'https://upload.cloudlift.app/s/yam-c' },
            { name: 'upload-left-chest', value: 'https://upload.cloudlift.app/s/yam-c' },
            { name: 'upload-right-chest', value: 'https://upload.cloudlift.app/s/yam-c' },
            { name: 'upload-back-chest', value: '' },
            { name: 'artist', value: '' }
          ]
        }
      ]
    }
  } else {
    throw new Error(`Order ${orderNum} not found`)
  }
}

// Reactive data
const orderNumber = ref('')
const orderData = ref(null)
const loading = ref(false)
const error = ref('')
const successMessage = ref('')
const loadingMessage = ref('')
const updatingProperties = ref(false)

// Modal data
const showAddPropertyModal = ref(false)
const currentLineItem = ref(null)
const addingProperty = ref(false)
const newProperty = ref({
  name: '',
  value: '',
  type: 'text'
})

// Link property names (properties that should be URL inputs)
const linkPropertyNames = [
  'upload-artwork',
  'upload-left-chest',
  'upload-right-chest',
  'upload-back-chest'
]

// Methods
const searchOrder = async () => {
  if (!orderNumber.value.trim()) {
    error.value = 'Please enter an order number'
    return
  }

  loading.value = true
  error.value = ''
  successMessage.value = ''
  loadingMessage.value = 'Searching for order...'

  try {
    // Check if we have Shopify integration available
    const config = useRuntimeConfig()
    
    if (config.public.shopifyDomain) {
      // Use real Shopify API
      const { $shopify } = useNuxtApp()
      const order = await $shopify.searchOrderByNumber(orderNumber.value)
      orderData.value = order
    } else {
      // Use mock data for demo
      await new Promise(resolve => setTimeout(resolve, 1000))
      const order = getMockOrderData(orderNumber.value)
      orderData.value = order
    }
  } catch (err) {
    error.value = err.message || 'Failed to fetch order data'
    orderData.value = null
  } finally {
    loading.value = false
    loadingMessage.value = ''
  }
}

const getExistingProperties = (item) => {
  // Only return properties that actually exist in the item's properties array
  if (!item.properties || !Array.isArray(item.properties)) {
    return []
  }
  
  // Filter out empty properties and return only existing ones
  return item.properties.filter(prop => prop.name && prop.name.trim() !== '')
}

const isLinkProperty = (propertyName) => {
  return linkPropertyNames.includes(propertyName)
}

const formatPropertyName = (name) => {
  return name.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')
}

const updatePropertyValue = async (item, property) => {
  if (!orderData.value) return
  
  try {
    updatingProperties.value = true
    loadingMessage.value = 'Updating property...'
    loading.value = true

    // Get all current properties for this item
    const allProperties = getExistingProperties(item)
    
    const config = useRuntimeConfig()
    
    if (config.public.shopifyDomain) {
      // Use real Shopify API
      const { $shopify } = useNuxtApp()
      await $shopify.updateLineItemProperties(
        orderData.value.id,
        item.id,
        allProperties
      )
    } else {
      // Simulate update for demo
      await new Promise(resolve => setTimeout(resolve, 500))
    }
    
    successMessage.value = `Property "${formatPropertyName(property.name)}" updated successfully!`
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  } catch (err) {
    error.value = 'Failed to update property: ' + (err.message || 'Unknown error')
  } finally {
    updatingProperties.value = false
    loading.value = false
    loadingMessage.value = ''
  }
}

const deleteProperty = async (item, propertyToDelete) => {
  if (!orderData.value) return
  
  try {
    updatingProperties.value = true
    loadingMessage.value = 'Deleting property...'
    loading.value = true

    // Remove the property from the item's properties array
    const updatedProperties = item.properties.filter(prop => prop.name !== propertyToDelete.name)
    item.properties = updatedProperties
    
    const config = useRuntimeConfig()
    
    if (config.public.shopifyDomain) {
      // Use real Shopify API
      const { $shopify } = useNuxtApp()
      await $shopify.updateLineItemProperties(
        orderData.value.id,
        item.id,
        updatedProperties
      )
    } else {
      // Simulate update for demo
      await new Promise(resolve => setTimeout(resolve, 500))
    }
    
    successMessage.value = `Property "${formatPropertyName(propertyToDelete.name)}" deleted successfully!`
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  } catch (err) {
    error.value = 'Failed to delete property: ' + (err.message || 'Unknown error')
  } finally {
    updatingProperties.value = false
    loading.value = false
    loadingMessage.value = ''
  }
}

const openAddPropertyModal = (item) => {
  currentLineItem.value = item
  newProperty.value = {
    name: '',
    value: '',
    type: 'text'
  }
  showAddPropertyModal.value = true
}

const closeAddPropertyModal = () => {
  showAddPropertyModal.value = false
  currentLineItem.value = null
  newProperty.value = {
    name: '',
    value: '',
    type: 'text'
  }
}

const addNewProperty = async () => {
  if (!currentLineItem.value || !newProperty.value.name) return
  
  try {
    addingProperty.value = true

    // Add the new property to the item's properties array
    if (!currentLineItem.value.properties) {
      currentLineItem.value.properties = []
    }
    
    // Check if property already exists
    const existingProperty = currentLineItem.value.properties.find(
      prop => prop.name === newProperty.value.name
    )
    
    if (existingProperty) {
      // Update existing property
      existingProperty.value = newProperty.value.value
    } else {
      // Add new property
      currentLineItem.value.properties.push({
        name: newProperty.value.name,
        value: newProperty.value.value
      })
    }
    
    const config = useRuntimeConfig()
    
    if (config.public.shopifyDomain) {
      // Use real Shopify API
      const { $shopify } = useNuxtApp()
      await $shopify.updateLineItemProperties(
        orderData.value.id,
        currentLineItem.value.id,
        currentLineItem.value.properties
      )
    } else {
      // Simulate update for demo
      await new Promise(resolve => setTimeout(resolve, 500))
    }
    
    successMessage.value = `Property "${formatPropertyName(newProperty.value.name)}" added successfully!`
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
    
    closeAddPropertyModal()
  } catch (err) {
    error.value = 'Failed to add property: ' + (err.message || 'Unknown error')
  } finally {
    addingProperty.value = false
  }
}

const getCustomerName = () => {
  if (!orderData.value?.customer) return 'Test Customer'
  const { first_name, last_name } = orderData.value.customer
  return `${first_name || ''} ${last_name || ''}`.trim() || 'Unknown Customer'
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString()
}

const getStatusClass = () => {
  const status = orderData.value?.fulfillment_status?.toLowerCase() || 'processing'
  return status
}

const getItemSize = (item) => {
  return item.variant_title || 'N/A'
}

const clearError = () => {
  error.value = ''
}
</script>

<style scoped>
.order-management-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.header-section {
  background: rgba(52, 73, 94, 0.95);
  border-radius: 20px 20px 0 0;
  padding: 2rem;
  text-align: center;
  backdrop-filter: blur(10px);
}

.main-title {
  color: white;
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 2rem 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.search-section {
  display: flex;
  gap: 1rem;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
}

.order-input {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  border: none;
  border-radius: 25px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  min-width: 300px;
  backdrop-filter: blur(10px);
}

.order-input::placeholder {
  color: rgba(255, 255, 255, 0.7);
}

.order-input:focus {
  outline: none;
  background: rgba(255, 255, 255, 0.2);
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.3);
}

.search-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 2rem;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(52, 152, 219, 0.3);
}

.search-button:hover:not(:disabled) {
  background: #2980b9;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(52, 152, 219, 0.4);
}

.search-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.search-icon {
  width: 1.2rem;
  height: 1.2rem;
}

.welcome-section {
  background: rgba(255, 255, 255, 0.95);
  padding: 4rem 2rem;
  text-align: center;
  border-radius: 0 0 20px 20px;
  backdrop-filter: blur(10px);
}

.welcome-title {
  color: #8a8a8a;
  font-size: 1.8rem;
  margin: 0 0 1rem 0;
  font-weight: 500;
}

.welcome-text {
  color: #a0a0a0;
  font-size: 1.1rem;
  margin: 0;
}

.loading-section {
  background: rgba(255, 255, 255, 0.95);
  padding: 4rem 2rem;
  text-align: center;
  border-radius: 0 0 20px 20px;
  backdrop-filter: blur(10px);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e3e3e3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-section {
  background: rgba(231, 76, 60, 0.1);
  border: 2px solid #e74c3c;
  border-radius: 0 0 20px 20px;
  padding: 2rem;
  text-align: center;
}

.error-message {
  color: #e74c3c;
  font-size: 1.1rem;
  margin: 0 0 1rem 0;
  font-weight: 500;
}

.retry-button {
  padding: 0.5rem 1.5rem;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.3s ease;
}

.retry-button:hover {
  background: #c0392b;
}

.order-details-section {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 0 0 20px 20px;
  backdrop-filter: blur(10px);
}

.order-details-header {
  background: #e74c3c;
  color: white;
  padding: 1.5rem 2rem;
  margin: 0;
}

.order-details-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.order-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  padding: 2rem;
  background: #e74c3c;
}

.info-card {
  background: rgba(255, 255, 255, 0.1);
  padding: 1rem;
  border-radius: 8px;
  backdrop-filter: blur(10px);
}

.info-card label {
  display: block;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.info-card span {
  color: white;
  font-weight: 600;
  font-size: 1rem;
}

.status-badge {
  background: #8e44ad;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-badge.processing {
  background: #8e44ad;
}

.line-items-section {
  padding: 2rem;
}

.line-items-section h3 {
  color: #2c3e50;
  font-size: 1.4rem;
  margin: 0 0 1.5rem 0;
  font-weight: 600;
}

.table-container {
  overflow-x: auto;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.line-items-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 12px;
  overflow: hidden;
}

.line-items-table th {
  background: #34495e;
  color: white;
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  font-size: 0.85rem;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.line-items-table td {
  padding: 1rem;
  border-bottom: 1px solid #ecf0f1;
  vertical-align: top;
}

.line-items-table tr:last-child td {
  border-bottom: none;
}

.line-items-table tr:hover {
  background: #f8f9fa;
}

.custom-properties {
  min-width: 300px;
}

.property-row {
  margin-bottom: 0.75rem;
}

.property-row:last-child {
  margin-bottom: 0;
}

.property-row label {
  display: block;
  font-size: 0.8rem;
  color: #7f8c8d;
  margin-bottom: 0.25rem;
  font-weight: 500;
}

.property-value {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.property-input {
  flex: 1;
  padding: 0.4rem 0.75rem;
  border: 1px solid #bdc3c7;
  border-radius: 6px;
  font-size: 0.85rem;
  transition: border-color 0.3s ease;
}

.property-input:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.1);
}

.delete-button {
  padding: 0.4rem 0.75rem;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: background 0.3s ease;
  flex-shrink: 0;
}

.delete-button:hover:not(:disabled) {
  background: #c0392b;
}

.delete-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.add-property-section {
  margin-top: 1rem;
  padding-top: 0.75rem;
  border-top: 1px solid #ecf0f1;
}

.add-property-button {
  background: #27ae60;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
}

.add-property-button:hover:not(:disabled) {
  background: #219a52;
  transform: translateY(-1px);
}

.add-property-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow: hidden;
}

.modal-header {
  background: #34495e;
  color: white;
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.modal-close {
  background: none;
  border: none;
  color: white;
  font-size: 2rem;
  cursor: pointer;
  padding: 0;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background 0.3s ease;
}

.modal-close:hover {
  background: rgba(255, 255, 255, 0.1);
}

.modal-body {
  padding: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #2c3e50;
  font-size: 0.9rem;
}

.modal-input,
.modal-select {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e1e8ed;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
  background: white;
}

.modal-input:focus,
.modal-select:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

.modal-select {
  cursor: pointer;
}

.modal-footer {
  background: #f8f9fa;
  padding: 1.5rem 2rem;
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.modal-cancel-button {
  padding: 0.75rem 1.5rem;
  background: #95a5a6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.3s ease;
}

.modal-cancel-button:hover {
  background: #7f8c8d;
}

.modal-add-button {
  padding: 0.75rem 1.5rem;
  background: #27ae60;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.modal-add-button:hover:not(:disabled) {
  background: #219a52;
  transform: translateY(-1px);
}

.modal-add-button:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
  transform: none;
}

.success-message {
  position: fixed;
  top: 2rem;
  right: 2rem;
  background: #27ae60;
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(39, 174, 96, 0.3);
  z-index: 1000;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .order-management-container {
    padding: 1rem;
  }
  
  .main-title {
    font-size: 2rem;
  }
  
  .order-input {
    min-width: 250px;
  }
  
  .search-section {
    flex-direction: column;
  }
  
  .order-info-grid {
    grid-template-columns: 1fr;
  }
  
  .property-value {
    flex-direction: column;
    align-items: stretch;
    gap: 0.25rem;
  }
  
  .delete-button {
    align-self: flex-start;
  }
  
  .modal-content {
    width: 95%;
    margin: 1rem;
  }
  
  .modal-body {
    padding: 1.5rem;
  }
  
  .modal-footer {
    flex-direction: column;
    padding: 1.5rem;
  }
  
  .modal-cancel-button,
  .modal-add-button {
    width: 100%;
  }
}
</style>