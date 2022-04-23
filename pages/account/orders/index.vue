<template>
  <div class="container md:pr-0">
    <h1 class="mb-8 hidden text-4xl md:block">
      {{ $t('account.orders.title') }}
    </h1>

    <div v-if="$fetchState.pending">
      <div class="loader-el m-auto mb-6 h-7 w-1/3" />
      <div class="loader-el m-auto mb-4 h-2 w-3/5" />
      <div class="loader-el m-auto mb-8 h-2 w-2/5" />
    </div>

    <div v-else>
      <template v-if="orders && orders.length">
        <AccountOrderContainer
          v-for="(order, index) in orders"
          :key="`order-${index}`"
          class="mb-6 last:mb-0"
          :order="order"
        />
      </template>

      <template v-else>
        <p class="text-sm text-primary-dark">
          {{ $t('account.orders.noOrders') }}
        </p>

        <BaseButton
          class="mt-10 block"
          fit="auto"
          appearance="dark"
          icon="shopping-bag"
          :label="$t('account.orders.backToProducts')"
          :link="shopLink"
        />
      </template>
    </div>
  </div>
</template>

<script>
export default {
  layout: 'account',

  data() {
    return {
      orders: null,
      shopLink: null,
    }
  },

  async fetch() {
    // Set page data
    const { $swell } = this
    const { results: orders } = await $swell.account.listOrders()

    this.orders = orders
    this.shopLink = await $swell.settings.get('cart.shopLink', '/categories/')
  },

  head() {
    return { title: this.$t('account.orders.title') }
  },
}
</script>
