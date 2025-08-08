export default defineNuxtPlugin(() => {
  const shopify = useShopify()
  
  return {
    provide: {
      shopify
    }
  }
})
