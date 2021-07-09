<template>
  <div class="container md:pr-0">
    <h1 class="text-4xl hidden md:block mb-8">
      {{ $t('account.orders.title') }}
    </h1>

    <div v-if="$fetchState.pending">
      <div class="loader-el w-1/3 h-7 mb-6 m-auto" />
      <div class="loader-el w-3/5 h-2 mb-4 m-auto" />
      <div class="loader-el w-2/5 h-2 mb-8 m-auto" />
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
          class="block mt-10"
          fit="auto"
          appearance="dark"
          icon="shopping-bag"
          :label="$t('account.orders.backToProducts')"
          :link="localePath('/products/')"
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
    }
  },
  async fetch() {
    // Set page data
    const { results: orders } = await this.$swell.account.listOrders()
    this.orders = orders
  },
}
</script>
