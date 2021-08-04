<template>
  <div class="relative">
    <div class="container">
      <!-- Breadcrumb -->
      <NuxtLink
        :to="localePath('/account/subscriptions/')"
        class="flex items-center cursor-pointer mb-6"
      >
        <BaseIcon icon="uil:angle-left" size="sm" /><span class="ml-1">
          {{ $t('account.subscriptions.id.backToSubscriptions') }}
        </span>
      </NuxtLink>
    </div>

    <!-- Fetch loader -->
    <div v-if="$fetchState.pending" class="container">
      <div class="loader-el w-1/3 h-7 mb-6" />
      <div class="loader-el w-3/5 h-2 mb-4" />
      <div class="loader-el w-2/5 h-2 mb-8" />
    </div>

    <div v-else>
      <div class="container pb-10 border-b border-primary-med">
        <div class="pb-6 border-b border-primary-med mb-6">
          <h2 class="text-2xl pb-6">
            {{ subscription.product.name }}
          </h2>

          <!-- Active -->
          <div v-if="status === 'active'" class="flex">
            <div
              class="
                relative
                flex-shrink-0
                w-6
                h-6
                mr-2
                bg-ok-default
                rounded-full
              "
            >
              <BaseIcon
                class="absolute text-primary-lightest center-xy"
                icon="uil:sync"
                size="w-4 h-4"
              />
            </div>
            <div>
              <p>
                {{ $t('account.subscriptions.subscription.status.active') }}
                {{ renewalDate }}
              </p>
              <p class="text-sm text-primary-dark">
                {{
                  $t('account.subscriptions.subscription.status.activeMessage')
                }}
              </p>
            </div>
          </div>

          <!-- Canceled -->
          <div v-else-if="status === 'canceled'" class="flex">
            <div
              class="
                relative
                flex-shrink-0
                w-6
                h-6
                mr-2
                bg-primary-dark
                rounded-full
              "
            >
              <BaseIcon
                class="absolute text-primary-lightest center-xy"
                icon="uil:sync-slash"
                size="w-4 h-4"
              />
            </div>
            <div>
              <p>
                {{ $t('account.subscriptions.subscription.status.canceled') }}
                {{ formatDate(subscription.dateCanceled) }}
              </p>
              <p class="text-sm text-primary-dark">
                {{
                  $t(
                    'account.subscriptions.subscription.status.canceledMessage'
                  )
                }}
              </p>
            </div>
          </div>

          <!-- Trial -->
          <div v-else-if="status === 'trial'" class="flex">
            <div
              class="
                relative
                flex-shrink-0
                w-6
                h-6
                mr-2
                bg-warning-default
                rounded-full
              "
            >
              <BaseIcon
                class="absolute text-primary-lightest center-xy"
                icon="uil:calender"
                size="w-4 h-4"
              />
            </div>
            <div>
              <p>
                {{ $t('account.subscriptions.subscription.status.trial') }}
                {{ formatDate(subscription.dateTrialEnd) }}
              </p>
              <p class="text-sm text-primary-dark">
                {{
                  $t('account.subscriptions.subscription.status.trialMessage')
                }}
                {{ subscription.interval }} at
                {{
                  formatMoney(
                    subscription.recurringTotal,
                    subscription.currency
                  )
                }}
              </p>
            </div>
          </div>
        </div>

        <!-- Plan items -->
        <template v-if="planItems">
          <span class="label-xs-bold-faded">{{
            $t('account.subscriptions.id.planItems')
          }}</span>

          <div class="mb-6 md:grid md:grid-cols-2 md:col-gap-4">
            <div
              v-for="(item, index) in planItems"
              :key="`plan-item-${index}`"
              class="w-full flex py-6 border-b border-primary-light"
            >
              <div class="min-w-26 mr-6">
                <VisualMedia :source="selectThumbnail(item)" sizes="120px" />
              </div>

              <div>
                <h4 class="pb-2">
                  {{ item.product.name }}
                </h4>
                <p v-if="item.quantity > 1" class="text-sm text-primary-darker">
                  {{
                    $tc('account.orders.id.quantity', item.quantity, {
                      count: item.quantity,
                    })
                  }}
                </p>
                <p
                  v-for="option in item.options"
                  :key="option.id"
                  class="text-sm text-primary-darker"
                >
                  <span>{{ option.name }}: {{ option.value }}</span>
                </p>
              </div>
            </div>
          </div>
        </template>

        <template v-else>
          <span class="label-xs-bold-faded">{{
            $t('account.subscriptions.id.plan')
          }}</span>

          <div class="mb-6 md:grid md:grid-cols-2 md:col-gap-4">
            <div class="w-full flex py-6 border-b border-primary-light">
              <div
                v-if="
                  subscription.variant.images &&
                  subscription.variant.images.length
                "
                class="min-w-26 mr-6"
              >
                <VisualMedia
                  :source="subscription.variant.images[0].file"
                  sizes="120px"
                />
              </div>

              <div
                v-else-if="
                  subscription.product.images &&
                  subscription.product.images.length
                "
                class="min-w-26 mr-6"
              >
                <VisualMedia
                  :source="subscription.product.images[0].file"
                  sizes="120px"
                />
              </div>

              <div>
                <h4 class="pb-2">
                  {{ subscription.product.name }}
                </h4>
                <p
                  v-if="subscription.quantity > 1"
                  class="text-sm text-primary-darker"
                >
                  {{
                    $tc('account.orders.id.quantity', subscription.quantity, {
                      count: subscription.quantity,
                    })
                  }}
                </p>
                <p
                  v-for="option in subscription.options"
                  :key="option.id"
                  class="text-sm text-primary-darker"
                >
                  <span>{{ option.name }}: {{ option.value }}</span>
                </p>
              </div>
            </div>
          </div>
        </template>

        <div class="bg-primary-lightest rounded shadow-md">
          <div
            class="p-4"
            :class="{ 'border-b border-primary-med': status !== 'canceled' }"
          >
            <div
              v-if="subscriptionOrder.subscriptionDelivery"
              class="flex pb-2"
            >
              <span>{{ $t('account.subscriptions.id.shipping') }}</span>
              <span class="ml-auto">{{
                subscriptionOrder.shipmentPrice === 0
                  ? $t('account.subscriptions.id.freeShipping')
                  : formatMoney(
                      subscriptionOrder.shipmentPrice,
                      subscriptionOrder.currency
                    )
              }}</span>
            </div>

            <div class="flex text-lg font-semibold">
              <span>{{ $t('account.subscriptions.id.total') }}</span>
              <span class="ml-auto">{{
                formatMoney(subscription.grandTotal, subscription.currency)
              }}</span>
            </div>
          </div>

          <div v-if="status !== 'canceled'" class="p-4 text-sm">
            <div class="flex items-center mb-2">
              <BaseIcon icon="uil:calender" size="sm" class="mr-2" />
              <p v-if="status === 'trial'">
                {{ $t('account.subscriptions.id.trialEnds') }}
                <span class="label-sm-bold">{{
                  formatDate(subscription.dateTrialEnd)
                }}</span>
              </p>
              <p v-else-if="status === 'active'">
                {{ $t('account.subscriptions.id.nextOrder') }}
                <span class="label-sm-bold">{{
                  formatDate(subscription.datePeriodEnd)
                }}</span>
              </p>
            </div>

            <div class="flex items-center">
              <BaseIcon icon="uil:sync" size="sm" class="mr-2" />
              <p>
                {{ $t('account.subscriptions.id.planRenews') }}
                <span class="label-sm-bold">{{ subscription.interval }}</span>
              </p>
            </div>

            <BaseButton
              v-if="status !== 'canceled'"
              class="w-full block mt-6"
              fit="auto"
              appearance="dark"
              :label="$t('account.subscriptions.id.editPlan')"
              :link="
                localePath(`/account/subscriptions/${subscription.id}/edit/`)
              "
            />
          </div>
        </div>
      </div>

      <div class="container pt-4">
        <!-- Delievry details -->
        <template v-if="shipping">
          <p class="text-base font-semibold pb-4">
            {{ $t('account.subscriptions.id.deliveryDetails') }}
          </p>

          <div class="mb-8">
            <div class="rounded text-sm border border-primary-med p-4">
              <p class="font-semibold pb-2">
                {{ $t('account.subscriptions.id.deliveryAddress') }}
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
                {{ $t('account.subscriptions.id.phoneNumber') }}
              </p>
              <p>
                {{ shipping.phone }}
              </p>
            </div>
            <div
              v-if="shipping && shipping.service"
              class="rounded text-sm border border-primary-med p-4 -mt-px"
            >
              <p class="font-semibold pb-2">
                {{ $t('account.subscriptions.id.deliveryMethod') }}
              </p>
              <p v-if="shipping.serviceName">
                {{ shipping.serviceName }}
                <span v-if="shipping.price">
                  ({{
                    formatMoney(shipping.price, subscriptionOrder.currency)
                  }})
                </span>
              </p>
            </div>
          </div>

          <!-- TODO: Add ability to change shipping address of subscriptions independently. -->
          <!-- <button
            v-if="status !== 'canceled'"
            class="btn light w-full md:w-auto"
            @click="editShippingAddressPopupIsActive = true"
          >
            {{ $t('account.subscriptions.id.changeDelivery') }}
          </button> -->
        </template>

        <!-- Payment details -->
        <div class="mb-8">
          <p class="text-base font-semibold pb-4">
            {{ $t('account.subscriptions.id.paymentMethod') }}
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
              v-if="billing.card"
              class="md:border-b-0 md:border-r border-b border-primary-med p-4"
            >
              <div class="flex mb-0 md:mb-4">
                <BrandCardIcon
                  :brand="billing.card.brand"
                  class="pr-4 md:pr-0"
                />

                <span
                  class="ml-0 md:ml-auto pr-4 md:pl-4 text-sm font-semibold"
                  >{{ billing.card.brand }}</span
                >

                <div class="text-base md:hidden ml-auto">
                  <span class="tracking-large">····</span>
                  <span>&nbsp;{{ billing.card.last4 }}</span>
                  <span class="ml-6">{{ cardExpDate }}</span>
                </div>
              </div>

              <div class="hidden md:flex mb-4">
                <div class="text-base">
                  <span class="tracking-large">···· ····</span>
                  <span>&nbsp;{{ billing.card.last4 }}</span>
                </div>

                <span class="ml-auto">{{ cardExpDate }}</span>
              </div>
            </div>

            <div v-if="billing" class="flex md:text-sm p-4">
              <div>
                <p class="font-semibold pb-2">
                  {{ $t('account.subscriptions.id.billingAddress') }}
                </p>
                <p>
                  {{ billing.name }}<br />
                  {{ billing.address2 }} {{ billing.address1 }},
                  {{ billing.city }} {{ billing.zip }}<br />
                  {{ billing.state }} {{ billing.country }}
                </p>
              </div>

              <button
                v-if="status !== 'canceled'"
                class="pl-6 pr-2 ml-auto mt-auto"
                @click="editBillingAddressPopupIsActive = true"
              >
                {{ $t('account.subscriptions.id.editBillingAddress') }}
              </button>
            </div>
          </div>
        </div>

        <div v-if="orders" class="mb-10">
          <p class="text-base font-semibold pt-10 pb-4">
            {{ $t('account.subscriptions.id.orders') }}
          </p>

          <NuxtLink
            v-for="order in orders"
            :key="order.id"
            :to="localePath(`/account/orders/${order.id}/`)"
            append
            class="flex w-full md:w-1/2"
          >
            <span class="label-sm-bold">{{
              formatDate(order.dateCreated)
            }}</span>
            <span class="label-sm ml-auto">#{{ order.number }}</span>
          </NuxtLink>
        </div>

        <BaseButton
          v-if="status !== 'canceled'"
          appearance="light-error"
          fit="auto"
          :label="$t('account.subscriptions.id.cancelSubscription')"
          @click.native="cancelPopupIsActive = true"
        />
      </div>
    </div>

    <AccountAddressPopup
      v-if="editShippingAddressPopupIsActive"
      type="update"
      :address="shipping"
      :is-updating="isUpdating"
      @click-close="editShippingAddressPopupIsActive = false"
      @update="updateShippingAddress"
    />

    <AccountAddressPopup
      v-if="editBillingAddressPopupIsActive"
      type="update"
      :address="billing"
      :is-updating="isUpdating"
      @click-close="editBillingAddressPopupIsActive = false"
      @update="updateBillingAddress"
    />

    <AccountConfirmationPopup
      v-if="cancelPopupIsActive"
      :heading="$t('account.subscriptions.id.popup.cancel.title')"
      :prompt-message="$t('account.subscriptions.id.popup.cancel.text')"
      :accept-label="$t('account.subscriptions.id.popup.cancel.yes')"
      :refuse-label="$t('account.subscriptions.id.popup.cancel.no')"
      :is-loading="isCanceling"
      :loading-label="$t('account.subscriptions.id.popup.cancel.loading')"
      @accept="cancelSubscription"
      @click-close="cancelPopupIsActive = false"
    />
  </div>
</template>

<script>
// Helpers
import { mapState } from 'vuex'
import padStart from 'lodash/padStart'
import isEmpty from 'lodash/isEmpty'

export default {
  name: 'Subscription',
  layout: 'account',

  data() {
    return {
      subscription: null,
      subscriptionOrder: null,
      editShippingAddressPopupIsActive: false,
      editBillingAddressPopupIsActive: false,
      cancelPopupIsActive: false,
      isCanceling: false,
      isUpdating: false,
    }
  },

  async fetch() {
    const subscription = await this.$swell.subscriptions.get(
      this.$route.params.id,
      {
        expand: ['product', 'variant', 'orders'],
      }
    )

    if (!subscription) return

    this.subscription = subscription

    if (subscription.orderId) {
      const subscriptionOrder = await this.$swell.account.getOrder(
        subscription.orderId
      )
      if (subscriptionOrder) this.subscriptionOrder = subscriptionOrder
    }
  },

  computed: {
    ...mapState(['currency']),

    renewalDate() {
      const d = new Date(this.subscription.datePeriodEnd)
      const date = this.formatDate(d, {
        weekday: 'short',
        month: 'long',
        day: 'numeric',
      })

      const time = d.toLocaleString('en', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
      })

      return this.$t('account.subscriptions.id.renewal', { date, time })
    },

    status() {
      if (!this.subscription) return
      return this.subscription.status
    },

    orders() {
      if (isEmpty(this.subscription.orders)) return
      return this.subscription.orders.results
    },

    shipping() {
      if (isEmpty(this.subscription.shipping)) return
      return this.subscription.shipping
    },

    billing() {
      if (isEmpty(this.subscription.billing)) return
      return this.subscription.billing
    },

    cardExpDate() {
      const mm = padStart(this.billing.card.expMonth, 2, '0')
      const yy = this.billing.card.expYear.toString().slice(-2)
      return `${mm} / ${yy}`
    },

    planItems() {
      if (!this.subscription.product.bundle) return
      return this.subscription.product.bundleItems
    },
  },

  methods: {
    formatDate(iso) {
      const date = new Date(iso)

      return new Intl.DateTimeFormat('default', {
        month: 'long',
        day: '2-digit',
        year: 'numeric',
      }).format(date)
    },

    selectThumbnail(item) {
      if (item.variant && item.variant.images && item.variant.images.length) {
        return item.variant.images[0].file
      }

      if (item.product.images.length) {
        return item.product.images[0].file
      }

      return {}
    },

    updateShippingAddress(addr) {
      this.isUpdating = true

      setTimeout(() => {}, 2000)

      this.isUpdating = false
      this.editShippingAddressPopupIsActive = false
      this.$store.dispatch('showNotification', {
        message: this.$t(
          'account.subscriptions.popup.update.shippingAddress.success'
        ),
      })
      this.$fetch()
    },

    async updateBillingAddress(addr) {
      this.isUpdating = true

      await this.$swell.subscriptions.update(this.subscription.id, {
        billing: addr,
      })

      this.isUpdating = false
      this.editBillingAddressPopupIsActive = false
      this.$store.dispatch('showNotification', {
        message: this.$t(
          'account.subscriptions.popup.update.billingAddress.success'
        ),
      })
      this.$fetch()
    },

    async cancelSubscription() {
      try {
        this.isCanceling = true

        await this.$swell.subscriptions.update(this.subscription.id, {
          canceled: true,
        })

        this.isCanceling = false
        this.cancelPopupIsActive = false

        this.$store.dispatch('showNotification', {
          message: this.$t('account.subscriptions.id.popup.cancel.success'),
          type: 'success',
        })
        this.$fetch()
      } catch (err) {
        this.isCanceling = false
        this.$store.dispatch('handleError', err)
      }
    },
  },
}
</script>
