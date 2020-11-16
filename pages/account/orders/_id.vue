<template>
  <div v-if="order">
    <div class="container">
      <!-- Breadcrumb -->
      <NuxtLink to="/account/orders/" class="flex flex-row items-center cursor-pointer">
        <BaseIcon icon="uil:angle-left" size="sm" /><span class="ml-1"
          >Back to all orders</span
        ></NuxtLink
      >

      <div class="py-6">
        <h2 class="text-2xl">Order #{{ order.number }}</h2>

        <div class="mt-4 mb-2">
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

          <span class="font-bold">{{ statusMessage }}</span>
        </div>

        <div class="text-sm rounded border border-primary-med p-4 mb-6">
          <div class="pb-2">
            <span>Order date</span>
            <span class="font-semibold">May 13, 2020</span>
          </div>

          <div class="pb-2">
            <span>Shipped</span>
            <span class="font-semibold">May 13, 2020</span>
          </div>

          <div>
            <span>Total</span>
            <span class="font-semibold">{{ formatMoney(order.grandTotal) }}</span>
          </div>
        </div>

        <button class="btn light w-full" type="button">
          Create a return
        </button>

        <div class="flex font-semibold py-6 border-b border-primary-med">
          <span>Order summary</span>
          <span class="ml-auto">{{ order.items.length }} items</span>
        </div>

        <div class="flex flex-wrap mb-6">
          <div
            v-for="item in order.items"
            :key="item.id"
            class="w-full flex py-6 border-b border-primary-light"
          >
            <div class="min-w-26 mr-6">
              <VisualMedia :source="item.product.images[0].file.url" />
            </div>

            <div>
              <h4 class="pb-2">{{ item.product.name }}</h4>
              <p class="text-sm text-primary-darker" v-if="item.quantity > 1">
                Qty: {{ item.quantity }}
              </p>
              <p
                v-for="option in item.options"
                :key="option.od"
                class="text-sm text-primary-darker"
              >
                <span>{{ option.name }}: {{ option.value }}</span>
              </p>
              <p class="pt-2 font-semibold text-sm">{{ formatMoney(item.priceTotal) }}</p>
            </div>
          </div>
        </div>

        <div v-if="order.shipmentDelivery" class="flex pb-2">
          <span>Shipping</span>
          <span class="ml-auto">{{
            order.shipmentPrice === 0 ? 'Free' : formatMoney(order.shipmentPrice)
          }}</span>
        </div>

        <div class="flex text-lg font-semibold">
          <span>Subtotal</span>
          <span class="ml-auto">{{ formatMoney(order.subTotal) }}</span>
        </div>
      </div>
    </div>

    <div class="border-b border-primary-med mb-10" />

    <div class="container">
      <template v-if="order.shipmentDelivery">
        <p class="text-base font-semibold pb-4">Delivery Details</p>

        <div class="mb-10">
          <div class="rounded text-sm border border-primary-med p-4">
            <p class="font-semibold pb-2">Delivery address</p>
            <p>
              {{ shipping.name }}<br />
              {{ shipping.address2 }} {{ shipping.address1 }}, {{ shipping.city }} {{ shipping.zip
              }}<br />
              {{ shipping.state }} {{ getCountryName(shipping.country) }}
            </p>
          </div>
          <div v-if="shipping.phone" class="rounded text-sm border border-primary-med p-4 -mt-px">
            <p class="font-semibold pb-2">Phone number</p>
            <p>
              {{ shipping.phone }}
            </p>
          </div>
          <div class="rounded text-sm border border-primary-med p-4 -mt-px">
            <p class="font-semibold pb-2">Delivery method</p>
            <p>
              {{ shipping.serviceName }}
            </p>
          </div>
        </div>

        <div class="mb-10">
          <p class="text-base font-semibold pb-4">Payment method</p>

          <div class="rounded border border-primary-med">
            <div class="flex justify-between border-b border-primary-med p-4">
              <span class="text-sm font-semibold">{{ billing.card.brand }}</span>
              <span class="tracking-large">{{ formattedCardNumber }}</span>
              <span>{{ expDate }}</span>
            </div>

            <div class="text-sm p-4">
              <p class="font-semibold pb-2">Billing address</p>
              <p>
                {{ billing.name }}<br />
                {{ billing.address2 }} {{ billing.address1 }}, {{ billing.city }}
                {{ billing.zip }}<br />
                {{ billing.state }} {{ getCountryName(billing.country) }}
              </p>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import find from 'lodash/find'

export default {
  async fetch() {
    // Set page data
    const { results: orders } = await this.$swell.account.getOrders()
    const order = find(orders, order => order.id === this.$route.params.id)

    if (order) this.order = order
    console.log(this.order)
  },

  data() {
    return {
      order: null
    }
  },

  computed: {
    shipping() {
      return this.order.shipping
    },
    billing() {
      return this.order.billing
    },

    expDate() {
      return `${this.billing.card.expMonth} / ${this.billing.card.expYear.toString().slice(-2)}`
    },

    formattedCardNumber() {
      const { brand, last4 } = this.billing.card
      if (brand === 'American Express') {
        return `···${last4.substring(0, 1)} ${last4.substring(1, last4.length)}`
      } else {
        return `···· ${last4}`
      }
    },

    statusMessage() {
      switch (this.order.status) {
        case 'pending':
          return 'Order is pending'
          break
        case 'draft':
          return 'Draft'
          break
        case 'payment_pending':
          return 'Pending payment'
          break
        case 'delivery_pending':
          return 'Pending delivery'
          break
        case 'hold':
          return 'On hold'
          break
        case 'complete':
          return 'Fulfilled'
          break
        case 'canceled':
          return 'Cancelled'
          break
        default:
          return
      }
    }
  },

  layout: 'account'
}
</script>

<style lang="scss" scoped></style>
