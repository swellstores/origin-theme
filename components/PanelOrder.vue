<template>
  <div class="bg-primary-lightest md:py-0 py-4 rounded shadow-md">
    <div class="container md:p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="grid grid-cols-2 gap-4 md:mb-0 mb-4">
        <div
          v-for="(media, index) in itemMedia"
          :key="`product-media-${index}`"
          class="relative rounded overflow-hidden"
        >
          <VisualMedia :source="media" sizes="120px" />

          <div
            v-if="order.items.length > itemMedia.length && index === itemMedia.length - 1"
            class="overlay text-primary-lightest"
          >
            <span class="absolute center-xy text-lg font-semibold text-primary-lightest">
              +{{ order.items.length - itemMedia.length }}
            </span>
          </div>
        </div>
      </div>

      <div class="flex flex-col">
        <h2 class="text-xl">Order #{{ order.number || order.id }}</h2>
        <div class="mb-2">
          <svg
            class="w-2 h-2 fill-current inline-block mr-1"
            :class="{
              'text-ok': order.status === 'complete',
              'text-error': order.status === 'canceled',
              'text-primary-dark': order.status !== 'complete' || order.status !== 'canceled'
            }"
            fill="none"
            viewBox="0 0 10 10"
          >
            <circle cx="5" cy="5" r="5" />
          </svg>

          <span class="text-sm">{{ statusMessage }}</span>
        </div>

        <p class="text-sm mb-2">
          <span class="pr-2">Order date</span>
          <span class="font-semibold">{{ formattedDate }}</span>
        </p>

        <p class="text-sm mb-10">
          <span class="pr-2">Total</span>
          <span class="font-semibold">{{ formatMoney(order.grandTotal) }}</span>
        </p>

        <NuxtLink :to="`${order.id}/`" append class="btn light w-full mt-auto">
          View order
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script>
import flatMap from 'lodash/flatMap'
import get from 'lodash/get'

export default {
  props: {
    order: {
      type: Object,
      default: null
    }
  },

  computed: {
    itemMedia() {
      // Get max of 4 images per item of order
      if (!this.order.items) return
      return flatMap(this.order.items.slice(0, 4), (item, index) => {
        if (!item.product.images.length) return
        return get(item.product, 'images[0].file')
      })
    },

    formattedDate() {
      if (!this.order) return
      const date = new Date(this.order.dateCreated)
      return new Intl.DateTimeFormat('default', {
        month: 'long',
        day: '2-digit',
        year: 'numeric'
      }).format(date)
    },

    statusMessage() {
      switch (this.order.status) {
        case 'pending':
          return 'We have received your order!'
          break
        case 'draft':
          return 'Your order is currently in draft mode.'
          break
        case 'payment_pending':
          return 'Your order is pending payment.'
          break
        case 'delivery_pending':
          return 'Your order is pending delivery.'
          break
        case 'hold':
          return 'Your order is currently on hold.'
          break
        case 'complete':
          return 'Your order has been fulfilled.'
          break
        case 'canceled':
          return 'Your order has been cancelled'
          break
        default:
          return
      }
    }
  }
}
</script>

<style lang="postcss" scoped>
.overlay {
  @apply opacity-50 absolute top-0 left-0 w-full h-full bg-primary-darker;
}
</style>
