<template>
  <div class="container md:pr-0">
    <h1 class="mb-8 hidden text-4xl md:block">
      {{ $t('account.subscriptions.title') }}
    </h1>

    <div v-if="$fetchState.pending">
      <div class="loader-el m-auto mb-6 h-7 w-1/3" />
      <div class="loader-el m-auto mb-4 h-2 w-3/5" />
      <div class="loader-el m-auto mb-8 h-2 w-2/5" />
    </div>

    <div v-else>
      <template v-if="subscriptions && subscriptions.length">
        <AccountSubscriptionContainer
          v-for="(subscription, index) in subscriptions"
          :key="`order-${index}`"
          class="mb-6 last:mb-0"
          :subscription="subscription"
        />
      </template>

      <template v-else>
        <p class="text-sm text-primary-dark">
          {{ $t('account.subscriptions.noSubscriptions') }}
        </p>

        <BaseButton
          class="mt-10 block"
          fit="auto"
          appearance="dark"
          icon="shopping-bag"
          :label="$t('account.subscriptions.backToProducts')"
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
      subscriptions: null,
      shopLink: null,
    }
  },

  async fetch() {
    // Set page data
    const { $swell } = this
    const { results: subscriptions } = await this.$swell.subscriptions.get({
      expand: ['product', 'variant'],
    })

    this.subscriptions = subscriptions
    this.shopLink = await $swell.settings.get('cart.shopLink', '/categories/')
  },

  head() {
    return { title: this.$t('account.subscriptions.title') }
  },

  activated() {
    // Refetch updated data
    this.$fetch()
  },
}
</script>
