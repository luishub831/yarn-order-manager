export interface ShopifyOrder {
  id: number
  name: string
  order_number: number
  created_at: string
  updated_at: string
  total_price: string
  fulfillment_status?: string
  financial_status?: string
  customer?: {
    id: number
    first_name?: string
    last_name?: string
    email?: string
  }
  line_items: ShopifyLineItem[]
  shipping_address?: ShopifyAddress
  billing_address?: ShopifyAddress
}

export interface ShopifyLineItem {
  id: number
  title: string
  name: string
  sku?: string
  quantity: number
  price: string
  variant_id?: number
  variant_title?: string
  properties?: Array<{
    name: string
    value: string
  }>
}

export interface ShopifyAddress {
  first_name?: string
  last_name?: string
  company?: string
  address1?: string
  address2?: string
  city?: string
  province?: string
  country?: string
  zip?: string
  phone?: string
}

export interface CustomProperty {
  name: string
  value: string
  hasLink: boolean
}
