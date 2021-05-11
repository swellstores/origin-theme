<template>
  <div class="container">
    <!-- Breadcrumb -->
    <NuxtLink
      v-if="previousOrderRoute"
      :to="localePath(previousOrderRoute ? previousOrderRoute : '/account/orders/')"
      class="flex items-center cursor-pointer mb-6"
    >
      <BaseIcon icon="uil:angle-left" size="sm" />
      <span class="ml-1">{{
        $tc('account.orders.returns.backToOrders', previousOrderRoute ? 1 : 2)
      }}</span>
    </NuxtLink>

    <div class="mb-16">
      <h1 class="text-2xl">{{ $t('account.orders.returns.title') }}</h1>
      <p v-balance-text.children class="text-sm" v-html="$t('account.orders.returns.infoText')"></p>
    </div>

    <div class="flex">
      <NuxtLink
        v-if="previousOrderRoute"
        :to="localePath('/account/orders/')"
        class="w-full md:w-auto btn light mb-6 md:mr-6"
      >
        {{ $tc('account.orders.returns.backToOrders', 2) }}
      </NuxtLink>

      <NuxtLink
        :to="localePath('/products/')"
        class="w-full md:w-auto inline-flex justify-center items-center btn dark"
      >
        <BaseIcon icon="uil:shopping-bag" size="sm" class="mr-2" />
        {{ $t('account.orders.backToProducts') }}
      </NuxtLink>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      previousOrderRoute: ''
    }
  },

  watch: {
    // If routing from order, set breadcrumb.
    $route(_to, from) {
      if (from.params.id) this.previousOrderRoute = from.path
    }
  },

  mounted() {
    const {
      $nuxt: {
        context: { from }
      }
    } = this

    // If routing from order, set breadcrumb.
    if (from) {
      this.previousOrderRoute = from.path
    }
  },

  layout: 'account'
}
</script>
