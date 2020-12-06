<template>
  <div>
    <div class="container">
      <!-- Breadcrumb -->
      <NuxtLink to="/account/orders/" class="flex items-center cursor-pointer mb-6">
        <BaseIcon icon="uil:angle-left" size="sm" /><span class="ml-1"
          >Back to all orders</span
        ></NuxtLink
      >
    </div>

    <!-- Fetch loader -->
    <div v-if="$fetchState.pending" class="container">
      <div class="loader-el w-1/3 h-7 mb-6"></div>
      <div class="loader-el w-3/5 h-2 mb-4"></div>
      <div class="loader-el w-2/5 h-2 mb-8"></div>
    </div>

    <div v-else>
      <div class="container">
        <div class="pb-6">
          <h2 class="text-2xl">Order #{{ order.number }}</h2>

          <div class="my-4">
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

          <div
            class="block md:flex md:justify-between text-sm rounded border border-primary-med p-4 mb-6"
          >
            <div class="pb-2 md:pb-0">
              <span>Order date</span>
              <span class="font-semibold">May 13, 2020</span>
            </div>

            <div class="pb-2 md:pb-0">
              <span>Shipped</span>
              <span class="font-semibold">May 13, 2020</span>
            </div>

            <div>
              <span>Total</span>
              <span class="font-semibold">{{ formatMoney(order.grandTotal) }}</span>
            </div>
          </div>

          <NuxtLink to="/account/orders/returns/" append class="btn light">
            Create a return
          </NuxtLink>

          <!-- Order summary -->
          <div class="flex font-semibold py-6 border-b border-primary-med">
            <span>Order summary</span>
            <span class="ml-auto">{{ order.items.length }} items</span>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 md:gap-4 mb-6">
            <div
              v-for="item in order.items"
              :key="item.id"
              class="w-full flex py-6 border-b border-primary-light"
            >
              <div class="min-w-26 mr-6">
                <VisualMedia :source="item.product.images[0].file" sizes="120px" />
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

          <div class="flex pb-2">
            <span>Subtotal</span>
            <span class="ml-auto">{{ formatMoney(order.subTotal) }}</span>
          </div>

          <div v-if="order.shipmentDelivery" class="flex pb-2">
            <span>Shipping</span>
            <span class="ml-auto">{{
              order.shipmentPrice === 0 ? 'Free' : formatMoney(order.shipmentPrice)
            }}</span>
          </div>

          <div v-if="order.itemDiscount > 0" class="flex pb-2">
            <span>Discounts & Credits</span>
            <span class="ml-auto">-{{ formatMoney(order.itemDiscount) }}</span>
          </div>

          <div class="flex text-lg font-semibold">
            <span>Total</span>
            <span class="ml-auto">{{ formatMoney(order.grandTotal) }}</span>
          </div>
        </div>
      </div>

      <div class="border-b border-primary-med mb-10" />

      <!-- Delivery details -->
      <div class="container">
        <template v-if="order.shipmentDelivery">
          <p class="text-base font-semibold pb-4">Delivery Details</p>

          <div class="mb-10">
            <div class="rounded text-sm border border-primary-med p-4">
              <p class="font-semibold pb-2">Delivery address</p>
              <p>
                {{ shipping.name }}<br />
                {{ shipping.address2 }} {{ shipping.address1 }}, {{ shipping.city }}
                {{ shipping.zip }}<br />
                {{ shipping.state }} {{ getCountryName(shipping.country) }}
              </p>
            </div>
            <div v-if="shipping.phone" class="rounded text-sm border border-primary-med p-4 -mt-px">
              <p class="font-semibold pb-2">Phone number</p>
              <p>
                {{ shipping.phone }}
              </p>
            </div>
            <div
              v-if="shipping.serviceName"
              class="rounded text-sm border border-primary-med p-4 -mt-px"
            >
              <p class="font-semibold pb-2">Delivery method</p>
              <p>
                {{ shipping.serviceName }}
              </p>
            </div>
          </div>

          <!-- Payment details -->
          <div class="mb-10">
            <p class="text-base font-semibold pb-4">Payment method</p>

            <div class="grid gridcols-1 md:grid-cols-2 rounded border border-primary-med">
              <div class="md:border-b-0 md: border-r border-b border-primary-med p-4">
                <div class="flex mb-4">
                  <BrandCardIcon :brand="billing.card.brand" />
                  <span class="ml-auto md:pl-4 md:ml-0 text-sm font-semibold">{{
                    billing.card.brand
                  }}</span>
                </div>

                <div class="flex mb-4">
                  <div class="text-base">
                    <span class="tracking-large">···· ····</span>
                    <span>&nbsp;{{ billing.card.last4 }}</span>
                  </div>

                  <span class="ml-auto">{{ expDate }}</span>
                </div>

                <span class="text-sm">{{ billing.name }}</span>
              </div>

              <div class="text-sm p-4">
                <p class="font-semibold pb-2">Billing address</p>
                <p>
                  {{ billing.name }}<br />
                  {{ billing.address2 }} {{ billing.address1 }}, {{ billing.city }} {{ billing.zip
                  }}<br />
                  {{ billing.state }} {{ getCountryName(billing.country) }}
                </p>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import find from 'lodash/find'

export default {
  name: 'Order',

  async fetch() {
    const order = await this.$swell.account.getOrder(this.$route.params.id)

    if (order) this.order = order
    console.log(order.billing)
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
