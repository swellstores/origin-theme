<template>
  <div class="container md:pr-0">
    <h1 class="text-4xl hidden md:block mb-8">
      {{ $t('account.subscriptions.title') }}
    </h1>

    <div v-if="$fetchState.pending">
      <div class="loader-el w-1/3 h-7 mb-6 m-auto" />
      <div class="loader-el w-3/5 h-2 mb-4 m-auto" />
      <div class="loader-el w-2/5 h-2 mb-8 m-auto" />
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
          class="block mt-10"
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

  activated() {
    // Refetch updated data
    this.$fetch()
  },
}
</script>
