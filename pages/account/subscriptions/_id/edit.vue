<template>
  <div>
    <!-- Fetch loader -->
    <div v-if="$fetchState.pending" class="container">
      <div class="loader-el mb-6 h-7 w-1/3" />
      <div class="loader-el mb-4 h-2 w-3/5" />
      <div class="loader-el mb-8 h-2 w-2/5" />
    </div>

    <div v-else>
      <div class="container pb-10">
        <!-- Breadcrumb -->
        <NuxtLink
          :to="localePath(`/account/subscriptions/${subscription.id}/`)"
          class="mb-6 flex cursor-pointer items-center"
        >
          <BaseIcon icon="uil:angle-left" size="sm" /><span class="ml-1">
            {{ $t('account.subscriptions._id.edit.backToSubscription') }}
            {{ subscriptionName }}
          </span>
        </NuxtLink>

        <div class="mb-6">
          <h2 class="mb-2 text-2xl">
            {{ $t('account.subscriptions._id.edit.title') }}
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

        <!-- Allow email contact to edit plan -->
        <a
          v-if="
            !allowFrequencyEdit &&
            !allowOptionsEdit &&
            status !== 'canceled' &&
            supportEmail
          "
          :href="'mailto:' + supportEmail"
          class="btn light mb-6 md:w-auto"
        >
          {{ $t('account.subscriptions._id.edit.contact') }}
        </a>

        <!-- Edit frequency of plan -->
        <BaseButton
          v-if="allowFrequencyEdit && status !== 'canceled'"
          class="mb-6"
          fit="auto"
          appearance="light"
          :label="$t('account.subscriptions._id.edit.changeFrequency')"
          @click.native="changeFrequencyPopupisActive = true"
        />

        <!-- Plan items -->
        <span class="label-xs-bold-faded block">{{
          $t('account.subscriptions._id.edit.plan')
        }}</span>

        <div class="mb-6 border-b border-primary-light">
          <div class="flex w-full py-6">
            <div v-if="planThumbnail" class="mr-6 min-w-26">
              <VisualMedia :source="planThumbnail.file" sizes="120px" />
            </div>

            <div class="text-sm text-primary-darker">
              <h4 class="pb-2">{{ subscription.product.name }}</h4>
              <p v-if="subscription.quantity > 1">
                {{
                  $tc('account.orders._id.quantity', subscription.quantity, {
                    count: subscription.quantity,
                  })
                }}
              </p>
              <p v-for="option in subscription.options" :key="option.id">
                <span>{{ option.name }}: {{ option.value }}</span>
              </p>
              <p class="font-semibold">
                {{
                  formatMoney(
                    subscription.recurringTotal,
                    subscription.currency,
                  )
                }}
              </p>
            </div>

            <!-- Edit plan options -->
          </div>
          <BaseButton
            v-if="
              status !== 'canceled' && allowOptionsEdit && planOptions.length
            "
            class="mb-6 block"
            fit="auto"
            appearance="light"
            :label="$t('account.subscriptions._id.edit.changeOptions')"
            @click.native="changeOptionsPopupisActive = true"
          />
        </div>

        <!-- Cancel subscription -->
        <BaseButton
          v-if="status !== 'canceled'"
          class="mb-6 block"
          fit="auto"
          appearance="light-error"
          :label="$t('account.subscriptions._id.cancelSubscription')"
          @click.native="cancelPopupIsActive = true"
        />
      </div>

      <!-- Change frequency/options popups -->
      <AccountEditFrequencyPopup
        v-if="changeFrequencyPopupisActive"
        :heading="
          $t('account.subscriptions._id.edit.popup.changeFrequency.title')
        "
        :text="$t('account.subscriptions._id.edit.popup.changeFrequency.text')"
        :accept-label="
          $t('account.subscriptions._id.edit.popup.changeFrequency.yes')
        "
        :refuse-label="
          $t('account.subscriptions._id.edit.popup.changeFrequency.no')
        "
        :loading-label="
          $t('account.subscriptions._id.edit.popup.changeFrequency.loading')
        "
        :plan-id="subscription.planId"
        :options="subscriptionOptions"
        :is-updating="isUpdating"
        @click-close="closeAndResetPopups"
        @update="updatePlan"
      />

      <AccountEditOptionsPopup
        v-if="changeOptionsPopupisActive"
        :heading="
          $t('account.subscriptions._id.edit.popup.changeOptions.title')
        "
        :accept-label="
          $t('account.subscriptions._id.edit.popup.changeOptions.yes')
        "
        :refuse-label="
          $t('account.subscriptions._id.edit.popup.changeOptions.no')
        "
        :loading-label="
          $t('account.subscriptions._id.edit.popup.changeOptions.loading')
        "
        :options="planOptions"
        :option-state="optionState"
        :is-updating="isUpdating"
        @click-close="closeAndResetPopups"
        @value-changed="setOptionValue"
        @update="updatePlan"
      />

      <AccountConfirmationPopup
        v-if="cancelPopupIsActive"
        :heading="$t('account.subscriptions._id.popup.cancel.title')"
        :prompt-message="$t('account.subscriptions._id.popup.cancel.text')"
        :accept-label="$t('account.subscriptions._id.popup.cancel.yes')"
        :refuse-label="$t('account.subscriptions._id.popup.cancel.no')"
        :is-loading="isCanceling"
        :loading-label="$t('account.subscriptions._id.popup.cancel.loading')"
        @accept="cancelSubscription"
        @click-close="cancelPopupIsActive = false"
      />
    </div>
  </div>
</template>

<script>
// Helpers
import { mapState } from 'vuex';
import filter from 'lodash/filter';
import get from 'lodash/get';

export default {
  name: 'SubscriptionEdit',
  layout: 'account',

  data() {
    return {
      store: null,
      subscription: null,
      optionState: null,
      changeFrequencyPopupisActive: false,
      changeOptionsPopupisActive: false,
      cancelPopupIsActive: false,
      isCanceling: false,
      isUpdating: false,
      allowFrequencyEdit: true,
      allowOptionsEdit: true,
      supportEmail: '',
    };
  },

  async fetch() {
    const { $swell } = this;

    const subscription = await $swell.subscriptions.get(this.$route.params.id, {
      expand: ['product', 'variant'],
    });

    // Show 404 if subscription isn't found
    if (!subscription) {
      return this.$nuxt.error({ statusCode: 404 });
    }

    // Set component data
    this.subscription = subscription;
    this.allowFrequencyEdit = await $swell.settings.get(
      'account.subscriptions.allowFrequencyEdit',
      false,
    );
    this.allowOptionsEdit = await $swell.settings.get(
      'account.subscriptions.allowOptionsEdit',
      false,
    );

    this.supportEmail = await $swell.settings.get('store.supportEmail');

    // Compute initial values for options
    this.resetOptionValues();
  },

  computed: {
    ...mapState(['currency']),

    subscriptionName() {
      if (!this.subscription) return;
      return this.subscription.product.name;
    },

    subscriptionOptions() {
      return this.subscription.product.purchaseOptions.subscription.plans;
    },

    planOptions() {
      return filter(
        this.subscription.product.options,
        (option) => !option.subscription,
      );
    },

    planThumbnail() {
      const { subscription } = this;

      if (subscription.variant?.images?.length) {
        return get(subscription, 'variant.images[0]');
      }

      return get(subscription, 'product.images[0]');
    },

    status() {
      if (!this.subscription) return;
      return this.subscription.status;
    },

    planItems() {
      if (this.subscription.product.bundle) return;
      return this.subscription.product.bundleItems;
    },
  },

  activated() {
    // Refetch updated data
    this.$fetch();
  },

  methods: {
    resetOptionValues() {
      // Reset option values
      // Compute initial values for options
      this.optionState = (this.subscription.product.options || []).reduce(
        (options, { name, values, id }) => {
          // If option has been set, select for current option,
          // otherwise fallback to first available option
          const matched = this.subscription.options?.find(
            (option) => option.id === id,
          );
          options[name] = matched ? matched.value : get(values, '0.name');

          return options;
        },
        {},
      );
    },

    closeAndResetPopups() {
      this.changeFrequencyPopupisActive = false;
      this.changeOptionsPopupisActive = false;
      this.resetOptionValues();
    },

    // Update an option value based on user input
    setOptionValue({ option, value }) {
      // Use $set to update the data object because options are dynamic
      // and optionState won't be reactive otherwise
      // TODO in Vue 3 this.optionState[option] = value should work
      this.$set(this.optionState, option, value);
    },

    async cancelSubscription() {
      try {
        this.isCanceling = true;

        await this.$swell.subscriptions.update(this.subscription.id, {
          canceled: true,
        });

        this.isCanceling = false;
        this.cancelPopupIsActive = false;

        this.$store.dispatch('showNotification', {
          message: this.$t('account.subscriptions._id.popup.cancel.success'),
          type: 'success',
        });
        this.$fetch();
      } catch (err) {
        this.isCanceling = false;
        this.$store.dispatch('handleError', err);
      }
    },

    async updatePlan(type = 'options', value) {
      this.isUpdating = true;
      let options = {};

      if (type === 'frequency') {
        options = {
          plan_id: value,
          billing_schedule: '',
        };
      }

      try {
        await this.$swell.subscriptions.update(this.subscription.id, options);
        this.isUpdating = false;
        this.changeOptionsPopupisActive = false;
        this.changeFrequencyPopupisActive = false;

        this.$store.dispatch('showNotification', {
          message:
            type === 'frequency'
              ? this.$t(
                  'account.subscriptions._id.edit.popup.changeFrequency.success',
                )
              : this.$t(
                  'account.subscriptions._id.edit.popup.changeOptions.success',
                ),
          type: 'success',
        });

        this.$fetch();
      } catch (err) {
        this.$store.dispatch('handleError', err);
      }
    },
  },
};
</script>
