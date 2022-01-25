<template>
  <div class="rounded bg-primary-lightest py-4 shadow-md md:py-0">
    <div class="container grid grid-cols-1 gap-4 md:grid-cols-2 md:p-4">
      <div
        class="mb-4 grid md:mb-0"
        :class="{
          'grid-cols-1 gap-4 md:grid-cols-2': thumbnails.length === 1,
          'grid-cols-2 gap-4': thumbnails.length === 2,
          'grid-cols-2 grid-rows-2 gap-4': thumbnails.length > 2,
        }"
      >
        <div
          v-for="(media, index) in thumbnails"
          :key="`product-media-${index}`"
          class="relative overflow-hidden rounded"
        >
          <VisualMedia v-if="media" :source="media" sizes="120px" />

          <div v-else class="relative rounded bg-primary-lighter pb-full">
            <BaseIcon
              icon="uil:camera-slash"
              size="lg"
              class="center-xy absolute text-primary-med"
            />
          </div>

          <div
            v-if="
              orderProducts.length > thumbnails.length &&
              index === thumbnails.length - 1
            "
            class="overlay text-primary-lightest"
          >
            <span
              class="center-xy absolute text-lg font-semibold text-primary-lightest"
            >
              +{{ orderProducts.length - thumbnails.length }}
            </span>
          </div>
        </div>
      </div>

      <div class="flex flex-col">
        <div class="mb-3 hidden md:flex md:items-center">
          <h2 class="mb-0 inline-block text-xl">
            {{ statusMessage[1] }}
          </h2>
          <svg
            class="ml-2 inline-block h-3 w-3 fill-current"
            :class="{
              'text-ok-default': order.status === 'complete',
              'text-error-default': order.status === 'canceled',
              'text-primary-dark':
                order.status !== 'complete' || order.status !== 'canceled',
            }"
            fill="none"
            viewBox="0 0 10 10"
          >
            <circle cx="5" cy="5" r="5" />
          </svg>
        </div>

        <h2 class="md:hidden">
          {{ $t('account.orders.order.title') }} #{{ order.number }}
        </h2>

        <p class="mb-2 text-sm">
          <span class="pr-2">{{ $t('account.orders.order.date') }}</span>
          <span class="font-semibold">{{ formattedDate }}</span>
        </p>

        <p class="mb-2 text-sm">
          <span class="pr-2">{{ $t('account.orders.order.title') }}</span>
          <span class="font-semibold">#{{ order.number }}</span>
        </p>

        <p class="mb-2 text-sm">
          <span class="pr-2">{{ $t('account.orders.order.total') }}</span>
          <span class="font-semibold">{{
            formatMoney(order.grandTotal, order.currency)
          }}</span>
        </p>

        <div class="mb-10 md:hidden">
          <svg
            class="mr-1 inline-block h-2 w-2 fill-current"
            :class="{
              'text-ok-default': order.status === 'complete',
              'text-error-default': order.status === 'canceled',
              'text-primary-dark':
                order.status !== 'complete' || order.status !== 'canceled',
            }"
            fill="none"
            viewBox="0 0 10 10"
          >
            <circle cx="5" cy="5" r="5" />
          </svg>

          <span class="text-sm">{{ statusMessage[0] }}</span>
        </div>

        <BaseButton
          class="mt-auto"
          :link="localePath(`/account/orders/${order.id}/`)"
          appearance="light"
          :label="$t('account.orders.order.view')"
        />
      </div>
    </div>
  </div>
</template>

<script>
// Helpers
import flatMap from 'lodash/flatMap'
import get from 'lodash/get'

export default {
  props: {
    order: {
      type: Object,
      default: null,
    },
  },

  computed: {
    thumbnails() {
      // Get max of 4 images per item of order
      if (!this.orderProducts.length) return []

      return flatMap(this.orderProducts.slice(0, 4), (item) => {
        if (!item.images?.length) return null
        return get(item, 'images[0].file', false)
      })
    },

    orderProducts() {
      if (!this.order.items) return []

      return flatMap(this.order.items, (item) => {
        if (!item.product) return []
        return item.product
      })
    },

    formattedDate() {
      if (!this.order) return
      const date = new Date(this.order.dateCreated)
      return new Intl.DateTimeFormat('default', {
        month: 'long',
        day: '2-digit',
        year: 'numeric',
      }).format(date)
    },

    statusMessage() {
      switch (this.order.status) {
        case 'pending':
          return [
            this.$t('account.orders.order.status.pendingMessage'),
            this.$t('account.orders.order.status.pending'),
          ]
        case 'draft':
          return [
            this.$t('account.orders.order.status.draftMessage'),
            this.$t('account.orders.order.status.draft'),
          ]
        case 'payment_pending':
          return [
            this.$t('account.orders.order.status.pendingPaymentMessage'),
            this.$t('account.orders.order.status.pendingPayment'),
          ]
        case 'delivery_pending':
          return [
            this.$t('account.orders.order.status.pendingDeliveryMessage'),
            this.$t('account.orders.order.status.pendingDelivery'),
          ]
        case 'hold':
          return [
            this.$t('account.orders.order.status.holdMessage'),
            this.$t('account.orders.order.status.hold'),
          ]
        case 'complete':
          return [
            this.$t('account.orders.order.status.completeMessage'),
            this.$t('account.orders.order.status.complete'),
          ]
        case 'canceled':
          return [
            this.$t('account.orders.order.status.canceledMessage'),
            this.$t('account.orders.order.status.canceled'),
          ]
        default:
          return ['', '']
      }
    },
  },
}
</script>

<style lang="postcss" scoped>
.overlay {
  @apply absolute top-0 left-0 h-full w-full bg-primary-darker opacity-50;
}
</style>
