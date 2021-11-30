<template>
  <div>
    <div class="container">
      <!-- Breadcrumb -->
      <NuxtLink
        :to="localePath('/account/orders/')"
        class="flex items-center cursor-pointer mb-6"
      >
        <BaseIcon icon="uil:angle-left" size="sm" /><span class="ml-1">{{
          $t('account.orders.id.backToOrders')
        }}</span>
      </NuxtLink>
    </div>

    <!-- Fetch loader -->
    <div v-if="$fetchState.pending" class="container">
      <div class="loader-el w-1/3 h-7 mb-6" />
      <div class="loader-el w-3/5 h-2 mb-4" />
      <div class="loader-el w-2/5 h-2 mb-8" />
    </div>

    <div v-else>
      <div class="container">
        <div class="pb-6 border-b border-primary-med mb-10">
          <h2 class="text-2xl">
            {{ $t('account.orders.id.order') }} #{{ order.number }}
          </h2>

          <div class="my-4">
            <svg
              class="w-2 h-2 fill-current inline-block mr-1"
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

            <span class="font-bold">{{ statusMessage }}</span>
          </div>

          <div
            class="
              block
              md:flex md:justify-between
              text-sm
              rounded
              border border-primary-med
              p-4
              mb-6
            "
          >
            <div class="pb-2 md:pb-0">
              <span>{{ $t('account.orders.id.orderDate') }}</span>
              <span class="font-semibold">{{
                formatDate(order.dateCreated)
              }}</span>
            </div>

            <!-- <div class="pb-2 md:pb-0">
              <span>Shipped</span>
              <span class="font-semibold">May 13, 2020</span>
            </div> -->

            <div>
              <span>{{ $t('account.orders.id.total') }}</span>
              <span class="font-semibold">{{
                formatMoney(order.grandTotal, order.currency)
              }}</span>
            </div>
          </div>

          <BaseButton
            v-if="order.status === 'complete'"
            fit="auto"
            appearance="light"
            :label="$t('account.orders.id.createReturn')"
            :link="{
              url: localePath('/account/orders/returns/'),
              title: 'Create return',
            }"
          />

          <!-- Order summary -->
          <div class="flex font-semibold py-6 border-b border-primary-med">
            <span>{{ $t('account.orders.id.orderSummary') }}</span>
            <span class="ml-auto">{{
              $tc('account.orders.id.items', order.items.length, {
                count: order.items.length,
              })
            }}</span>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 md:gap-4 mb-6">
            <div
              v-for="item in order.items"
              :key="item.id"
              class="w-full flex py-6 border-b border-primary-light"
            >
              <div class="min-w-26 mr-6">
                <VisualMedia
                  v-if="
                    item.product &&
                    item.product.images &&
                    item.product.images.length
                  "
                  :source="item.product.images[0].file"
                  sizes="120px"
                />
                <div v-else class="relative bg-primary-light rounded pb-full">
                  <BaseIcon
                    icon="uil:camera-slash"
                    size="lg"
                    class="absolute center-xy text-primary-med"
                  />
                </div>
              </div>

              <div>
                <h4 class="pb-2">
                  {{ item.product ? item.product.name : '-' }}
                </h4>
                <div class="text-sm">
                  <p v-if="item.quantity > 1">
                    {{
                      $tc('account.orders.id.quantity', item.quantity, {
                        count: item.quantity,
                      })
                    }}
                  </p>
                  <p v-for="option in item.options" :key="option.id">
                    <span>{{ option.name }}: {{ option.value }}</span>
                  </p>

                  <div
                    v-if="item.bundleItems && item.bundleItems.length"
                    class="pt-2"
                  >
                    <p class="font-semibold">
                      {{ $t('account.orders.id.bundleIncludes') }}
                    </p>
                    <div
                      v-for="bundleItem in item.bundleItems"
                      :key="bundleItem.id"
                    >
                      <p>
                        {{ bundleItem.product.name }}
                        <span v-if="bundleItem.quantity > 1">
                          × {{ bundleItem.quantity }}
                        </span>
                      </p>

                      <p
                        v-for="option in bundleItem.options"
                        :key="option.id"
                        class="pl-4"
                      >
                        <span>{{ option.name }}: {{ option.value }}</span>
                      </p>
                    </div>
                  </div>
                  <p class="pt-2 font-semibold">
                    {{ formatMoney(item.priceTotal, order.currency) }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div class="flex pb-2">
            <span>{{ $t('account.orders.id.subtotal') }}</span>
            <span class="ml-auto">{{
              formatMoney(order.subTotal, order.currency)
            }}</span>
          </div>

          <div v-if="order.shipmentDelivery" class="flex pb-2">
            <span>{{ $t('account.orders.id.shipping') }}</span>
            <span class="ml-auto">{{
              order.shipmentPrice === 0
                ? 'Free'
                : formatMoney(order.shipmentPrice, order.currency)
            }}</span>
          </div>

          <div v-if="order.itemDiscount > 0" class="flex pb-2">
            <span>{{ $t('account.orders.id.discountsAndCredits') }}</span>
            <span class="ml-auto"
              >-{{ formatMoney(order.itemDiscount, order.currency) }}</span
            >
          </div>

          <div v-if="order.taxTotal > 0" class="flex pb-2">
            <span>{{ $t('account.orders.id.taxes') }}</span>
            <span class="ml-auto">{{
              formatMoney(order.taxTotal, order.currency)
            }}</span>
          </div>

          <div class="flex text-lg font-semibold">
            <span>{{ $t('account.orders.id.total') }}</span>
            <span class="ml-auto">{{
              formatMoney(order.grandTotal, order.currency)
            }}</span>
          </div>
        </div>
      </div>

      <!-- Delivery details -->
      <div class="container">
        <template v-if="order.shipmentDelivery">
          <p class="text-base font-semibold pb-4">
            {{ $t('account.orders.id.deliveryDetails') }}
          </p>

          <div class="mb-10">
            <div class="rounded text-sm border border-primary-med p-4">
              <p class="font-semibold pb-2">
                {{ $t('account.orders.id.deliveryAddress') }}
              </p>
              <p>
                {{ shipping.name }}<br />
                {{ shipping.address2 }} {{ shipping.address1 }},
                {{ shipping.city }} {{ shipping.zip }}<br />
                {{ shipping.state }} {{ shipping.country }}
              </p>
            </div>
            <div
              v-if="shipping.phone"
              class="rounded text-sm border border-primary-med p-4 -mt-px"
            >
              <p class="font-semibold pb-2">
                {{ $t('account.orders.id.phoneNumber') }}
              </p>
              <p>
                {{ shipping.phone }}
              </p>
            </div>
            <div class="rounded text-sm border border-primary-med p-4 -mt-px">
              <p class="font-semibold pb-2">
                {{ $t('account.orders.id.deliveryMethod') }}
              </p>
              <p v-if="shipping.serviceName">
                {{ shipping.serviceName }}
                <span v-if="shipping.price">
                  ({{ formatMoney(shipping.price, order.currency) }})
                </span>
              </p>
            </div>
            <div
              v-if="shipments"
              class="rounded text-sm border border-primary-med p-4 -mt-px"
            >
              <p class="font-semibold pb-2">
                {{ $t('account.orders.id.fulfilledDeliveries') }}
              </p>
              <div
                v-for="shipment in shipments"
                :key="shipment.id"
                class="mb-4"
              >
                <div class="grid grid-cols-2-max">
                  <strong class="pr-4 capitalize">{{
                    $tc('account.orders.id.items', shipment.items.length)
                  }}</strong>
                  <div>
                    <p v-for="item in shipment.items" :key="item.id">
                      {{ item.quantity }} ×
                      {{ item.product ? item.product.name : '-' }}
                    </p>
                  </div>

                  <template v-if="shipment.carrierName">
                    <strong class="pr-4">{{
                      $t('account.orders.id.carrier')
                    }}</strong>
                    <div>{{ shipment.carrierName }}</div>
                  </template>

                  <template v-if="shipment.trackingCode">
                    <strong class="pr-4">{{
                      $t('account.orders.id.trackingCode')
                    }}</strong>
                    <div>{{ shipment.trackingCode }}</div>
                  </template>

                  <template v-if="shipment.dateCreated">
                    <strong class="pr-4">{{
                      $t('account.orders.id.dateShipped')
                    }}</strong>
                    <div>{{ formatDate(shipment.dateCreated) }}</div>
                  </template>
                </div>
              </div>
            </div>
          </div>

          <!-- Payment details -->
          <template v-if="order.paid">
            <div class="mb-10">
              <p class="text-base font-semibold pb-4">
                {{ $t('account.orders.id.paymentMethod') }}
              </p>

              <div
                class="
                  grid grid-cols-1
                  md:grid-cols-2
                  rounded
                  border border-primary-med
                "
              >
                <!-- Method: Card -->
                <div
                  v-if="billing.card && billing.method === 'card'"
                  class="
                    md:border-b-0 md:border-r
                    border-b border-primary-med
                    p-4
                  "
                >
                  <div class="flex mb-4">
                    <BrandCardIcon :brand="billing.card.brand" />
                    <span
                      class="ml-auto md:pl-4 md:ml-0 text-sm font-semibold"
                      >{{ billing.card.brand }}</span
                    >
                  </div>

                  <div class="flex mb-4">
                    <div class="text-base">
                      <span class="tracking-large">···· ····</span>
                      <span>&nbsp;{{ billing.card.last4 }}</span>
                    </div>

                    <span class="ml-auto">{{ cardExpDate }}</span>
                  </div>

                  <span class="text-sm">{{ billing.name }}</span>
                </div>

                <!-- Method: Account Credit -->
                <div
                  v-else-if="billing.method === 'account'"
                  class="
                    md:border-b-0 md:border-r
                    border-b border-primary-med
                    p-4
                  "
                >
                  <div class="flex mb-4">
                    <BaseIcon icon="uil:money-bill" />
                    <span
                      class="ml-auto md:pl-4 md:ml-0 text-sm font-semibold"
                      >{{ $t('account.orders.id.accountCredit') }}</span
                    >
                  </div>
                  <p>{{ $t('account.orders.id.accountCreditMessage') }}</p>
                </div>

                <!-- Method: Gift Card -->
                <div
                  v-else-if="billing.method === 'giftcard' && order.giftcards"
                  class="
                    md:border-b-0 md:
                    border-r border-b border-primary-med
                    p-4
                  "
                >
                  <div class="flex mb-4">
                    <BaseIcon icon="uil:gift" />
                    <span
                      class="ml-auto md:pl-4 md:ml-0 text-sm font-semibold"
                      >{{ $t('account.orders.id.giftCard') }}</span
                    >
                  </div>

                  <p class="text-base tracking-large">
                    <span class="tracking-large"
                      >•••• •••• •••• {{ order.giftcards[0].last4 }}</span
                    >
                  </p>

                  <p class="text-sm pt-4">
                    <span class="font-semibold pr-2">{{
                      $t('account.orders.id.total')
                    }}</span
                    ><span>{{
                      formatMoney(order.giftcardTotal, order.currency)
                    }}</span>
                  </p>
                </div>

                <!-- Method: Bank Deposit -->
                <div
                  v-else-if="billing.method === 'bank_deposit'"
                  class="
                    md:border-b-0 md:border-r
                    border-b border-primary-med
                    p-4
                  "
                >
                  <div class="flex mb-4">
                    <BaseIcon icon="uil:University" />
                    <span
                      class="ml-auto md:pl-4 md:ml-0 text-sm font-semibold"
                      >{{ $t('account.orders.id.bankDeposit') }}</span
                    >
                  </div>
                  <p>{{ $t('account.orders.id.bankDepositMessage') }}</p>
                </div>

                <!-- Method: Cash on delivery -->
                <div
                  v-else-if="billing.method === 'cash_on_delivery'"
                  class="
                    md:border-b-0 md:
                    border-r border-b border-primary-med
                    p-4
                  "
                >
                  <div class="flex mb-4">
                    <BaseIcon icon="uil:money-bill" />
                    <span
                      class="ml-auto md:pl-4 md:ml-0 text-sm font-semibold"
                      >{{ $t('account.orders.id.cashOnDelivery') }}</span
                    >
                  </div>
                  <p>{{ $t('account.orders.id.cashOnDeliveryMessage') }}</p>
                </div>

                <div class="text-sm p-4">
                  <p class="font-semibold pb-2">
                    {{ $t('account.orders.id.billingAddress') }}
                  </p>
                  <p>
                    {{ billing.name }}<br />
                    {{ billing.address2 }} {{ billing.address1 }},
                    {{ billing.city }} {{ billing.zip }}<br />
                    {{ billing.state }} {{ billing.country }}
                  </p>
                </div>
              </div>
            </div>
          </template>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
// Helpers
import padStart from 'lodash/padStart'

export default {
  name: 'Order',
  layout: 'account',

  data() {
    return {
      order: null,
    }
  },

  async fetch() {
    const order = await this.$swell.account.getOrder(this.$route.params.id)

    if (order) this.order = order
  },

  computed: {
    shipping() {
      return this.order.shipping
    },

    billing() {
      return this.order.billing
    },

    shipments() {
      if (!this.order.shipments || !this.order.shipments.results.length) return
      return this.order.shipments.results
    },

    cardExpDate() {
      const mm = padStart(this.billing.card.expMonth, 2, '0')
      const yy = this.billing.card.expYear.toString().slice(-2)
      return `${mm} / ${yy}`
    },

    statusMessage() {
      switch (this.order.status) {
        case 'pending':
          return this.$t('account.orders.order.status.pending')
        case 'draft':
          return this.$t('account.orders.order.status.draft')
        case 'payment_pending':
          return this.$t('account.orders.order.status.pendingPayment')
        case 'delivery_pending':
          return this.$t('account.orders.order.status.pendingDelivery')
        case 'hold':
          return this.$t('account.orders.order.status.hold')
        case 'complete':
          return this.$t('account.orders.order.status.complete')
        case 'canceled':
          return this.$t('account.orders.order.status.canceled')
        default:
          return ''
      }
    },
  },
}
</script>
