<template>
  <div class="container">
    <!-- Breadcrumb -->
    <NuxtLink
      v-if="previousOrderRoute"
      :to="
        localePath(previousOrderRoute ? previousOrderRoute : '/account/orders/')
      "
      class="mb-6 flex cursor-pointer items-center"
    >
      <BaseIcon icon="uil:angle-left" size="sm" />
      <span class="ml-1">{{
        $tc('account.orders.returns.backToOrders', previousOrderRoute ? 1 : 2)
      }}</span>
    </NuxtLink>

    <div class="mb-16">
      <h1 class="text-2xl">
        {{ $t('account.orders.returns.title') }}
      </h1>
      <p class="text-sm" v-html="$t('account.orders.returns.infoText')" />
    </div>

    <BaseButton
      v-if="previousOrderRoute"
      class="mb-6 block w-full"
      fit="auto"
      appearance="light"
      :label="$tc('account.orders.returns.backToOrders', 2)"
      :link="localePath('/account/orders/')"
    />

    <BaseButton
      v-if="!previousOrderRoute"
      class="block w-full"
      fit="auto"
      appearance="dark"
      icon="shopping-bag"
      :label="$t('account.orders.backToProducts')"
      :link="shopLink"
    />
  </div>
</template>

<script>
export default {
  layout: 'account',

  data() {
    return {
      previousOrderRoute: '',
      shopLink: null,
    }
  },

  async fetch() {
    // Set page data
    const { $swell } = this

    this.shopLink = await $swell.settings.get('cart.shopLink', '/categories/')
  },

  watch: {
    // If routing from order, set breadcrumb.
    $route(_to, from) {
      if (from.params.id) this.previousOrderRoute = from.path
    },
  },

  mounted() {
    const {
      $nuxt: {
        context: { from },
      },
    } = this

    // If routing from order, set breadcrumb.
    if (from) {
      this.previousOrderRoute = from.path
    }
  },
}
</script>
