<template>
  <div>
    <!-- Fetch loader -->
    <div v-if="$fetchState.pending" class="container">
      <div class="loader-el w-1/3 h-7 mb-6" />
      <div class="loader-el w-3/5 h-2 mb-4" />
      <div class="loader-el w-2/5 h-2 mb-8" />
    </div>

    <div v-else>
      <div class="container pb-10">
        <!-- Breadcrumb -->
        <NuxtLink
          :to="localePath(`/account/subscriptions/${subscription.id}/`)"
          class="flex items-center cursor-pointer mb-6"
        >
          <BaseIcon icon="uil:angle-left" size="sm" /><span class="ml-1">
            {{ $t('account.subscriptions.id.edit.backToSubscription') }}
            {{ subscriptionName }}
          </span>
        </NuxtLink>

        <div class="mb-6">
          <h2 class="text-2xl mb-2">
            {{ $t('account.subscriptions.id.edit.title') }}
          </h2>

          <div class="mb-6">
            <span class="text-lg font-semibold">
              {{
                formatMoney(subscription.recurringTotal, subscription.currency)
              }}
              /
              {{ subscription.interval }}
            </span>
          </div>

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

                {{
                  $t('account.subscriptions.subscription.summary', {
                    interval: subscription.interval,
                    amount: formatMoney(subscription.recurringTotal, currency),
                  })
                }}
              </p>
            </div>
          </div>
        </div>

        <!--  TODO: Add ability to change frequency and plan item options. -->
        <!-- <button class="btn light w-full mb-6" @click="changeFrequencyPopupisActive = true">
          {{ $t('account.subscriptions.id.edit.changeFrequency') }}
        </button> -->

        <BaseButton
          v-if="status === 'trial'"
          class="w-full block mb-6 md:mr-4 md:mb-0"
          fit="auto"
          appearance="light-error"
          :label="$t('account.subscriptions.id.cancelSubscription')"
          @click.native="cancelPopupIsActive = true"
        />

        <a
          v-else-if="status === 'active'"
          :href="'mailto:' + store.supportEmail"
          class="btn light w-full md:w-auto mt-6"
        >
          {{ $t('account.subscriptions.id.edit.contact') }}
        </a>

        <!--  TODO: Add ability to change frequency and plan item options. -->
        <!-- Plan items -->
        <!-- <span class="label-xs-bold-faded">Plan</span>

        <div class="mb-6 md:grid md:grid-cols-2 md:col-gap-4">
          <div class="w-full flex py-6 border-b border-primary-light">
            <div v-if="subscription.variant.images" class="min-w-26 mr-6">
              <VisualMedia :source="subscription.variant.images[0].file" sizes="120px" />
            </div>

            <div>
              <h4 class="pb-2">{{ subscription.product.name }}</h4>
              <p v-if="subscription.quantity > 1" class="text-sm text-primary-darker">
                {{
                  $tc('account.orders.id.quantity', subscription.quantity, {
                    count: subscription.quantity
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

          <button class="btn light w-full mb-6" @click="changeOptionsPopupisActive = true">
            Change options
          </button>
        </div>

        <div class="mb-6">
          <div v-for="(item, index) in planItems" :key="`plan-item-${index}`"></div>
        </div> -->
      </div>

      <!--  TODO: Add ability to change frequency and plan item options. -->
      <!-- <AccountEditOptionsPopup
        v-if="changeFrequencyPopupisActive"
        heading="Change frequency"
        text="Changing your subscription frequency will also change all future order dates."
        :options="subscriptionOptions"
        :is-updating="isUpdating"
        @click-close="changeFrequencyPopupisActive = false"
        @update="updateSubscriptionFrequency"
      />

      <AccountEditOptionsPopup
        v-if="changeOptionsPopupisActive"
        :heading="subscription.product.name"
        :options="planOptions"
        :is-updating="isUpdating"
        @click-close="changeOptionsPopupisActive = false"
        @update="updatePlanOption"
      /> -->

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
  </div>
</template>

<script>
// Helpers
import { mapState } from 'vuex'
import filter from 'lodash/filter'

export default {
  name: 'Subscription',
  layout: 'account',

  data() {
    return {
      store: null,
      subscription: null,
      subscriptionOrder: null,
      // changeFrequencyPopupisActive: false,
      // changeOptionsPopupisActive: false,
      cancelPopupIsActive: false,
      isCanceling: false,
      isUpdating: false,
    }
  },

  async fetch() {
    const subscription = await this.$swell.subscriptions.get(
      this.$route.params.id,
      {
        expand: ['product', 'variant'],
      }
    )
    this.subscription = subscription

    this.store = this.$swell.settings.get('store', {})
  },

  computed: {
    ...mapState(['currency']),

    subscriptionName() {
      if (!this.subscription) return
      return this.subscription.product.name
    },

    subscriptionOptions() {
      const options = filter(this.subscription.product.options, 'subscription')
      return options
    },

    planOptions() {
      const options = filter(
        this.subscription.product.options,
        (option) => !option.subscription
      )
      return options
    },

    status() {
      if (!this.subscription) return
      return this.subscription.status
    },

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

    planItems() {
      if (this.subscription.product.bundle) return
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

    // TODO: Add ability to change frequency and plan item options.
    /* async updateSubscriptionFrequency(freq) {
      this.isUpdating = true
      let frequency = {}

      const val = Object.values(freq)[0]

      switch (val) {
        case 'Daily':
          frequency = {
            interval: 'daily',
            intervalCount: 1,
            options: [{ id: 'Plan', value: 'Daily' }]
          }
          break
        case 'Weekly':
          frequency = {
            interval: 'weekly',
            intervalCount: 1,
            options: [{ id: 'Plan', value: 'Weekly' }]
          }
          break
        case 'Monthly':
          frequency = {
            interval: 'monthly',
            intervalCount: 1,
            options: [{ id: 'Plan', value: 'Monthly' }]
          }
          break
        case 'Yearly':
          frequency = {
            interval: 'yearly',
            intervalCount: 1,
            options: [{ id: 'Plan', value: 'Yearly' }]
          }
          break
      }

      await this.$swell.subscriptions.update(this.subscription.id, frequency)

      this.isUpdating = false
      this.changeFrequencyPopupisActive = false
      this.$store.dispatch('showNotification', {
        message: 'Your subscription has been updated.',
        type: 'success'
      })
      this.$fetch()
    },

    async updatePlanOption(option) {
      this.isUpdating = true

      const val = Object.values(option)[0]
      await this.$swell.subscriptions.update(this.subscription.id, {
        options: [{ id: '60855ad11e98240c11d7d79d', value: val }]
      })

      this.isUpdating = false
      this.changeOptionsPopupisActive = false
      this.$store.dispatch('showNotification', {
        message: 'Your subscription has been updated.',
        type: 'success'
      })
      this.$fetch()
    } */
  },
}
</script>
