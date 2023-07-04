<template>
  <div class="relative">
    <div class="container">
      <!-- Breadcrumb -->
      <NuxtLink
        :to="localePath('/account/subscriptions/')"
        class="mb-6 flex cursor-pointer items-center"
      >
        <BaseIcon icon="uil:angle-left" size="sm" /><span class="ml-1">
          {{ $t('account.subscriptions._id.backToSubscriptions') }}
        </span>
      </NuxtLink>
    </div>

    <!-- Fetch loader -->
    <div v-if="$fetchState.pending" class="container">
      <div class="loader-el mb-6 h-7 w-1/3" />
      <div class="loader-el mb-4 h-2 w-3/5" />
      <div class="loader-el mb-8 h-2 w-2/5" />
    </div>

    <div v-else>
      <div class="container border-b border-primary-med pb-10">
        <div class="mb-6 border-b border-primary-med pb-6">
          <h2 class="pb-6 text-2xl">
            {{ subscription.product.name }}
          </h2>

          <AccountSubscriptionStatus
            :status="subscription.status"
            :interval="subscription.interval"
            :date-trial-end="subscription.dateTrialEnd"
            :date-canceled="subscription.dateCanceled"
            :date-paused="subscription.datePaused"
            :date-pause-end="subscription.datePauseEnd"
            :date-period-end="subscription.datePeriodEnd"
            :recurring-total="subscription.recurringTotal"
          />
        </div>

        <!-- Plan items -->
        <template v-if="planItems">
          <span class="label-xs-bold-faded">{{
            $t('account.subscriptions._id.planItems')
          }}</span>

          <div class="md:col-gap-4 mb-6 md:grid md:grid-cols-2">
            <div
              v-for="(item, index) in planItems"
              :key="`plan-item-${index}`"
              class="flex w-full border-b border-primary-light py-6"
            >
              <div class="mr-6 min-w-26">
                <VisualMedia :source="selectThumbnail(item)" sizes="120px" />
              </div>

              <div>
                <h4 class="pb-2">
                  {{ item.product.name }}
                </h4>
                <p v-if="item.quantity > 1" class="text-sm text-primary-darker">
                  {{
                    $tc('account.orders._id.quantity', item.quantity, {
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
            $t('account.subscriptions._id.plan')
          }}</span>

          <div class="md:col-gap-4 mb-6 md:grid md:grid-cols-2">
            <div class="flex w-full border-b border-primary-light py-6">
              <div
                v-if="
                  subscription.variant &&
                  subscription.variant.images &&
                  subscription.variant.images.length
                "
                class="mr-6 min-w-26"
              >
                <VisualMedia
                  :source="subscription.variant.images[0].file"
                  sizes="120px"
                />
              </div>

              <div
                v-else-if="
                  subscription.product &&
                  subscription.product.images &&
                  subscription.product.images.length
                "
                class="mr-6 min-w-26"
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
                    $tc('account.orders._id.quantity', subscription.quantity, {
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

        <div class="rounded bg-primary-lightest shadow-md">
          <div
            class="p-4"
            :class="{ 'border-b border-primary-med': status !== 'canceled' }"
          >
            <div class="flex pb-2">
              <span>{{ $t('account.subscriptions._id.planTotal') }}</span>
              <span class="ml-auto">
                {{
                  formatMoneyRounded(
                    subscription.recurringTotal,
                    subscription.currency,
                  )
                }}</span
              >
            </div>

            <div
              v-for="item in subscription.items"
              :key="item.id"
              class="flex pb-2"
            >
              <span>{{ item.description }}</span>
              <span class="ml-auto">
                {{ formatMoney(item.price, subscription.currency) }}</span
              >
            </div>

            <template v-if="subscriptionOrder">
              <div
                v-if="subscriptionOrder.subscriptionDelivery"
                class="flex pb-2"
              >
                <span>{{ $t('account.subscriptions._id.shipping') }}</span>
                <span class="ml-auto">{{
                  subscriptionOrder.shipmentPrice === 0
                    ? $t('account.subscriptions._id.freeShipping')
                    : formatMoney(
                        subscriptionOrder.shipmentPrice,
                        subscriptionOrder.currency,
                      )
                }}</span>
              </div>

              <div class="flex text-lg font-semibold">
                <span>{{ $t('account.subscriptions._id.total') }}</span>
                <span class="ml-auto">{{
                  formatMoneyRounded(
                    subscriptionOrder.grandTotal,
                    subscriptionOrder.currency,
                  )
                }}</span>
              </div>
            </template>
          </div>

          <div v-if="status !== 'canceled'" class="p-4 text-sm">
            <div class="mb-2 flex items-center">
              <BaseIcon icon="uil:calender" size="sm" class="mr-2" />
              <p v-if="status === 'trial'">
                {{ $t('account.subscriptions._id.trialEnds') }}
                <span class="label-sm-bold">{{
                  formatDate(subscription.dateTrialEnd)
                }}</span>
              </p>
              <p v-else-if="status === 'active'">
                {{ $t('account.subscriptions._id.nextOrder') }}
                <span class="label-sm-bold">{{
                  formatDate(subscription.datePeriodEnd)
                }}</span>
              </p>
            </div>

            <div class="flex items-center">
              <BaseIcon icon="uil:sync" size="sm" class="mr-2" />
              <p>
                {{ $t('account.subscriptions._id.planRenews') }}
                <span class="label-sm-bold">{{ subscription.interval }}</span>
              </p>
            </div>

            <BaseButton
              v-if="status !== 'canceled' && allowPlanEdit"
              class="mt-6 block w-full"
              fit="auto"
              appearance="dark"
              :label="$t('account.subscriptions._id.editPlan')"
              :link="
                localePath(`/account/subscriptions/${subscription.id}/edit/`)
              "
            />
          </div>
        </div>
      </div>

      <div class="container pt-4">
        <!-- Delivery details -->
        <template v-if="shipping">
          <p class="pb-4 text-base font-semibold">
            {{ $t('account.subscriptions._id.deliveryDetails') }}
          </p>

          <div class="mb-8">
            <div class="rounded border border-primary-med p-4 text-sm">
              <p class="pb-2 font-semibold">
                {{ $t('account.subscriptions._id.deliveryAddress') }}
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
              class="-mt-px rounded border border-primary-med p-4 text-sm"
            >
              <p class="pb-2 font-semibold">
                {{ $t('account.subscriptions._id.phoneNumber') }}
              </p>
              <p>
                {{ shipping.phone }}
              </p>
            </div>
            <div
              v-if="shipping && shipping.service"
              class="-mt-px rounded border border-primary-med p-4 text-sm"
            >
              <p class="pb-2 font-semibold">
                {{ $t('account.subscriptions._id.deliveryMethod') }}
              </p>
              <p v-if="shipping.serviceName">
                {{ shipping.serviceName }}
                <span v-if="shipping.price && subscriptionOrder">
                  ({{
                    formatMoney(shipping.price, subscriptionOrder.currency)
                  }})
                </span>
              </p>
            </div>
          </div>

          <BaseButton
            v-if="status !== 'canceled'"
            class="mb-8"
            appearance="light"
            fit="auto"
            :label="$t('account.subscriptions._id.changeDelivery')"
            @click.native="editShippingAddressPopupIsActive = true"
          />
        </template>

        <!-- Payment details -->
        <div class="mb-8">
          <p class="pb-4 text-base font-semibold">
            {{ $t('account.subscriptions._id.paymentMethod') }}
          </p>

          <div
            class="grid grid-cols-1 rounded border border-primary-med md:grid-cols-2"
          >
            <!-- Method: Card -->
            <div
              v-if="billing && billing.card"
              class="border-b border-primary-med p-4 md:border-b-0 md:border-r"
            >
              <div class="mb-0 flex md:mb-4">
                <BrandCardIcon
                  :brand="billing.card.brand"
                  class="pr-4 md:pr-0"
                />

                <span
                  class="ml-0 pr-4 text-sm font-semibold md:ml-auto md:pl-4"
                  >{{ billing.card.brand }}</span
                >

                <div class="ml-auto text-base md:hidden">
                  <span class="tracking-large">····</span>
                  <span>&nbsp;{{ billing.card.last4 }}</span>
                  <span class="ml-6">{{ cardExpDate }}</span>
                </div>
              </div>

              <div class="mb-4 hidden md:flex">
                <div class="text-base">
                  <span class="tracking-large">···· ····</span>
                  <span>&nbsp;{{ billing.card.last4 }}</span>
                </div>

                <span class="ml-auto">{{ cardExpDate }}</span>
              </div>
            </div>

            <div v-if="billing" class="flex p-4 md:text-sm">
              <div>
                <p class="pb-2 font-semibold">
                  {{ $t('account.subscriptions._id.billingAddress') }}
                </p>
                <p>
                  {{ billing.name }}<br />
                  {{ billing.address2 }} {{ billing.address1 }},
                  {{ billing.city }} {{ billing.zip }}<br />
                  {{ billing.state }} {{ billing.country }}<br />
                  {{ billing.phone }}
                </p>
              </div>

              <button
                v-if="status !== 'canceled'"
                class="mt-auto ml-auto px-2"
                @click="editBillingAddressPopupIsActive = true"
              >
                {{ $t('account.subscriptions._id.editBillingAddress') }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Pause/resume subscription -->
      <div
        v-if="pausable"
        class="container border-t border-b border-primary-med"
      >
        <div class="py-10">
          <p class="pb-4 text-base font-semibold">
            {{
              status === 'paused'
                ? $t('account.subscriptions._id.resume.title')
                : $t('account.subscriptions._id.pause.title')
            }}
          </p>

          <p class="pb-10">
            {{
              status === 'paused'
                ? $t('account.subscriptions._id.resume.message', {
                    date: formatDate(subscription.datePaused),
                  })
                : $t('account.subscriptions._id.pause.message')
            }}
          </p>

          <BaseButton
            class="block md:inline-block"
            fit="auto"
            :label="
              status === 'paused'
                ? $t('account.subscriptions._id.resume.label')
                : $t('account.subscriptions._id.pause.label')
            "
            @click.native="pauseResumeSubscriptionPopupIsActive = true"
          />
        </div>
      </div>

      <div class="container">
        <!-- Orders -->
        <div v-if="orders" class="mb-10">
          <p class="pt-10 pb-4 text-base font-semibold">
            {{ $t('account.subscriptions._id.orders') }}
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
          class="block md:inline-block"
          appearance="light-error"
          fit="auto"
          :label="$t('account.subscriptions._id.cancelSubscription')"
          @click.native="cancelPopupIsActive = true"
        />
      </div>
    </div>

    <AccountAddressPopup
      v-if="editShippingAddressPopupIsActive"
      type="update"
      :address="shipping"
      :is-updating="isUpdating"
      :defaultable="false"
      :flow="'subscription'"
      @click-close="editShippingAddressPopupIsActive = false"
      @update="updateShippingAddress"
    />

    <AccountAddressPopup
      v-if="editBillingAddressPopupIsActive"
      type="update"
      :address="billing"
      :is-updating="isUpdating"
      :defaultable="false"
      :flow="'subscription'"
      @click-close="editBillingAddressPopupIsActive = false"
      @update="updateBillingAddress"
    />

    <AccountPauseResumeSubscriptionPopup
      v-if="pauseResumeSubscriptionPopupIsActive"
      :status="status"
      :is-loading="isUpdating"
      :cycle-skippable="cycleSkippable"
      @pause-subscription="pauseSubscription"
      @resume-subscription="resumeSubscription"
      @select-date-time="selectDateTimePopupIsActive = true"
      @click-close="pauseResumeSubscriptionPopupIsActive = false"
    />

    <AccountSubscriptionDateTimePopup
      v-if="selectDateTimePopupIsActive"
      :is-loading="isUpdating"
      @resume-subscription="resumeSubscription"
      @click-close="selectDateTimePopupIsActive = false"
    />

    <AccountConfirmationPopup
      v-if="cancelPopupIsActive"
      :heading="$t('account.subscriptions._id.popup.cancel.title')"
      :prompt-message="$t('account.subscriptions._id.popup.cancel.text')"
      :accept-label="$t('account.subscriptions._id.popup.cancel.yes')"
      :refuse-label="$t('account.subscriptions._id.popup.cancel.no')"
      :is-loading="isUpdating"
      :loading-label="$t('account.subscriptions._id.popup.cancel.loading')"
      @accept="cancelSubscription"
      @click-close="cancelPopupIsActive = false"
    />
  </div>
</template>

<script>
// Helpers
import { mapState } from 'vuex';
import padStart from 'lodash/padStart';
import isEmpty from 'lodash/isEmpty';

export default {
  name: 'Subscription',
  layout: 'account',

  data() {
    return {
      subscription: null,
      subscriptionOrder: null,
      pauseSkipNext: false,
      pauseIndefinitely: false,
      pauseDuringTrial: false,
      pausePastDue: false,
      cycleSkippable: false,
      editShippingAddressPopupIsActive: false,
      editBillingAddressPopupIsActive: false,
      allowPlanEdit: true,
      pauseResumeSubscriptionPopupIsActive: false,
      selectDateTimePopupIsActive: false,
      cancelPopupIsActive: false,
      isUpdating: false,
    };
  },

  async fetch() {
    const { $swell } = this;

    // Fetch subscription
    const subscription = await this.$swell.subscriptions.get(
      this.$route.params.id,
      {
        expand: ['product', 'variant', 'orders'],
      },
    );

    // Show 404 if subscription data isn't found
    if (!subscription) {
      return this.$nuxt.error({ statusCode: 404 });
    }

    // Set component data
    this.subscription = subscription;
    this.allowPlanEdit = await $swell.settings.get(
      'account.subscriptions.allowPlanEdit',
      true,
    );
    // Fetch subscription settings
    const {
      features: {
        pauseIndefinitely,
        pauseSkipNext,
        pauseDuringTrial,
        pausePastDue,
      },
      pauseNextSkipThreshold,
    } = await this.$swell.settings.subscriptions();

    // Set component data
    this.pauseIndefinitely = pauseIndefinitely;
    this.pauseSkipNext = pauseSkipNext;
    this.pauseDuringTrial = pauseDuringTrial;
    this.pausePastDue = pausePastDue;

    if (subscription.orderId) {
      const subscriptionOrder = await $swell.account.getOrder(
        subscription.orderId,
      );
      if (subscriptionOrder) this.subscriptionOrder = subscriptionOrder;
    }

    // Determine if subscription cycle can be skipped
    if (pauseSkipNext) {
      const currentDate = new Date();
      const datePauseEnd = new Date(this.subscription.datePeriodEnd);

      const pauseNextSkipThresholdDate = new Date(
        datePauseEnd.setDate(datePauseEnd.getDate() - pauseNextSkipThreshold),
      );

      this.cycleSkippable = currentDate < pauseNextSkipThresholdDate;
    }
  },

  computed: {
    ...mapState(['currency']),

    status() {
      if (!this.subscription) return '';
      return this.subscription.status;
    },

    pausable() {
      switch (this.status) {
        case 'active':
          return (
            this.pauseIndefinitely ||
            (this.pauseSkipNext && this.cycleSkippable)
          );
        case 'trial':
          return this.pauseDuringTrial;
        case 'pastdue':
          return this.pausePastDue;
        case 'canceled':
          return false;
        case 'paused':
          return true;
        default:
          return false;
      }
    },

    orders() {
      if (isEmpty(this.subscription.orders)) return [];
      return this.subscription.orders.results;
    },

    shipping() {
      if (isEmpty(this.subscription.shipping)) return null;
      return this.subscription.shipping;
    },

    billing() {
      if (isEmpty(this.subscription.billing)) return null;
      return this.subscription.billing;
    },

    cardExpDate() {
      const mm = padStart(this.billing.card.expMonth, 2, '0');
      const yy = this.billing.card.expYear.toString().slice(-2);
      return `${mm} / ${yy}`;
    },

    planItems() {
      if (!this.subscription.product.bundle) return null;
      return this.subscription.product.bundleItems;
    },
  },

  activated() {
    // Refetch updated data
    this.$fetch();
  },

  methods: {
    selectThumbnail(item) {
      if (item.variant && item.variant.images && item.variant.images.length) {
        return item.variant.images[0].file;
      }

      if (item.product && item.product.images && item.product.images.length) {
        return item.product.images[0].file;
      }

      return {};
    },

    async updateShippingAddress(address) {
      try {
        this.isUpdating = true;

        await this.$swell.subscriptions.update(this.subscription.id, {
          shipping: address,
        });

        this.isUpdating = false;
        this.editShippingAddressPopupIsActive = false;
        this.$store.dispatch('showNotification', {
          message: this.$t('account.addresses.popup.save.success'),
        });
        this.$fetch();
      } catch (err) {
        this.isUpdating = false;
        this.$store.dispatch('showNotification', {
          message: this.$t('account.addresses.popup.save.error'),
          type: 'error',
        });
      }
    },

    async updateBillingAddress(address) {
      try {
        this.isUpdating = true;

        await this.$swell.subscriptions.update(this.subscription.id, {
          billing: address,
        });

        this.isUpdating = false;
        this.editBillingAddressPopupIsActive = false;
        this.$store.dispatch('showNotification', {
          message: this.$t('account.addresses.popup.save.success'),
        });
        this.$fetch();
      } catch (err) {
        this.isUpdating = false;
        this.$store.dispatch('showNotification', {
          message: this.$t('account.addresses.popup.save.error'),
          type: 'error',
        });
      }
    },

    async pauseSubscription(type) {
      const { subscription, $swell } = this;
      try {
        this.isUpdating = true;
        if (type === 'skip-cycle') {
          // Skip cycle
          await $swell.subscriptions.update(subscription.id, {
            paused: true,
            date_pause_end: subscription.datePeriodEnd,
          });

          this.$store.dispatch('showNotification', {
            message: this.$t(
              'account.subscriptions._id.popup.pause.skipCycleSuccess',
            ),
            type: 'success',
          });
        } else {
          // Pause immediately
          await $swell.subscriptions.update(subscription.id, {
            paused: true,
            date_pause_end: null,
          });

          this.$store.dispatch('showNotification', {
            message: this.$t('account.subscriptions._id.popup.pause.success'),
            type: 'success',
          });
        }

        this.isUpdating = false;
        this.pauseResumeSubscriptionPopupIsActive = false;
        this.$fetch();
      } catch (err) {
        this.isUpdating = false;
        this.$store.dispatch('handleError', err);
      }
    },

    async resumeSubscription(date) {
      const { subscription, $swell } = this;
      try {
        this.isUpdating = true;
        if (date) {
          // Resume on date
          await $swell.subscriptions.update(subscription.id, {
            paused: true,
            date_pause_end: date,
          });
        } else {
          // Resume immediately
          await $swell.subscriptions.update(subscription.id, {
            paused: false,
            date_pause_end: null,
          });
        }

        this.isUpdating = false;
        this.pauseResumeSubscriptionPopupIsActive = false;
        this.selectDateTimePopupIsActive = false;
        this.$store.dispatch('showNotification', {
          message: date
            ? this.$t('account.subscriptions._id.popup.chooseDate.success', {
                date: this.formatDate(date),
              })
            : this.$t('account.subscriptions._id.popup.resume.success'),
          type: 'success',
        });
        this.$fetch();
      } catch (err) {
        this.isUpdating = false;
        this.$store.dispatch('handleError', err);
      }
    },

    async cancelSubscription() {
      try {
        this.isUpdating = true;

        await this.$swell.subscriptions.update(this.subscription.id, {
          canceled: true,
        });

        this.isUpdating = false;
        this.cancelPopupIsActive = false;

        this.$store.dispatch('showNotification', {
          message: this.$t('account.subscriptions._id.popup.cancel.success'),
          type: 'success',
        });
        this.$fetch();
      } catch (err) {
        this.isUpdating = false;
        this.$store.dispatch('handleError', err);
      }
    },
  },
};
</script>
