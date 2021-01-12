<template>
  <div class="container md:pr-0">
    <h1 class="text-4xl hidden md:block mb-8">Orders & Returns</h1>

    <div v-if="$fetchState.pending">
      <div class="loader-el w-1/3 h-7 mb-6 m-auto"></div>
      <div class="loader-el w-3/5 h-2 mb-4 m-auto"></div>
      <div class="loader-el w-2/5 h-2 mb-8 m-auto"></div>
    </div>

    <div v-else>
      <template v-if="orders && orders.length">
        <AccountOrderContainer
          class="mb-6 last:mb-0"
          v-for="(order, index) in orders"
          :key="`order-${index}`"
          :order="order"
        />
      </template>

      <template v-else>
        <p class="text-sm text-primary-dark">
          You haven’t ordered anything yet.
        </p>

        <NuxtLink
          to="/products/"
          class="inline-flex justify-center items-center btn btn dark mt-10"
        >
          <BaseIcon icon="uil:shopping-bag" size="sm" class="mr-2" />
          Start shopping
        </NuxtLink>
      </template>
    </div>
  </div>
</template>

<script>
export default {
  async fetch() {
    // Set page data
    const { results: orders } = await this.$swell.account.listOrders()
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
