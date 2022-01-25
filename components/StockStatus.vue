<template>
  <div class="mb-3 flex flex-wrap justify-between">
    <div class="mr-2">
      <span
        :class="`bg-${status.color}-default`"
        class="mr-1 inline-block h-2 w-2 rounded-full"
      />
      <span class="label-xs-bold text-primary-dark">{{
        $t(status.label)
      }}</span>
      <span
        v-if="showStockLevel && stockLevel > 0 && bundleItemsAvailable"
        class="label-xs-bold text-primary-dark"
      >
        • {{ $t('products.slug.stockRemaining', { n: stockLevel }) }}
      </span>
    </div>
    <div class>
      <a v-if="status.link" href="#" class="label-sm-bold">{{
        $t(status.message)
      }}</a>
      <span v-else class="label-sm-faded">{{ $t(status.message) }}</span>
    </div>
  </div>
</template>

<script>
// Helpers
import get from 'lodash/get'

// TODO: replace this with global settings or singleton content
const statuses = {
  custom: {
    color: 'warning',
    label: 'products.slug.stockStatus.custom.label',
    message: 'products.slug.stockStatus.custom.message',
  },
  in_stock: {
    color: 'ok',
    label: 'products.slug.stockStatus.inStock.label',
    message: 'products.slug.stockStatus.inStock.message',
  },
  limited_availability: {
    color: 'warning',
    label: 'products.slug.stockStatus.limitedAvailability.label',
    message: 'products.slug.stockStatus.limitedAvailability.message',
  },
  out_of_stock: {
    color: 'error',
    label: 'products.slug.stockStatus.outOfStock.label',
    message: 'products.slug.stockStatus.outOfStock.message',
  },
  bundle_items_unavailable: {
    color: 'error',
    label: 'products.slug.stockStatus.bundleItemsUnavailable.label',
    message: 'products.slug.stockStatus.bundleItemsUnavailable.message',
  },
}

export default {
  name: 'StockStatus',

  props: {
    statusValue: {
      type: String,
      default: 'out_of_stock',
    },
    bundleItemsAvailable: {
      type: Boolean,
      default: true,
    },
    stockLevel: {
      type: Number,
      default: 0,
    },
    showStockLevel: {
      type: Boolean,
      default: false,
    },
  },

  computed: {
    status() {
      if (!this.bundleItemsAvailable)
        return get(statuses, 'bundle_items_unavailable', {})
      return get(statuses, this.statusValue || 'out_of_stock', {})
    },
  },
}
</script>
