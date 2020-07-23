<template>
  <div class="mb-3 flex flex-wrap justify-between">
    <div class="mr-2">
      <span :class="`bg-${status.color}`" class="inline-block rounded-full w-2 h-2 mr-1" />
      <span class="label-xs-bold text-primary-dark">{{ status.label }}</span>
    </div>
    <div class>
      <a v-if="status.link" href="#" class="label-sm-bold">{{ status.message }}</a>
      <span v-else class="label-sm-faded">{{ status.message }}</span>
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
    label: 'Custom order',
    message: 'Ships in 9–16 days'
  },
  in_stock: {
    color: 'ok',
    label: 'In stock',
    message: 'Ships in 1–2 days'
  },
  limited_availability: {
    color: 'warning',
    label: 'Low stock',
    message: 'Ships in 1–2 days'
  },
  out_of_stock: {
    color: 'error',
    label: 'Out of stock',
    message: 'Get notified when available',
    link: true
  }
}

export default {
  name: 'StockStatus',

  props: {
    statusValue: {
      type: String,
      default: 'out_of_stock'
    }
  },

  computed: {
    status() {
      return get(statuses, this.statusValue, {})
    }
  }
}
</script>
