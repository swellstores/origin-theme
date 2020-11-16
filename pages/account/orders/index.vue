<template>
  <div class="container">
    <PanelOrder
      class="mb-6"
      v-for="(order, index) in orders"
      :key="`order-${index}`"
      :order="order"
    />
  </div>
</template>

<script>
export default {
  async fetch() {
    // Set page data
    const { results: orders } = await this.$swell.account.getOrders()
    
    this.orders = orders
  },

  data() {
    return {
      orders: null
    }
  },

  layout: 'account'
}
</script>

<style lang="scss" scoped></style>
