<template>
  <div v-if="value && hasSubscriptionPlans" class="mt-8" role="group">
    <!-- One-time purchase -->

    <div v-if="options.standard" class="relative block mb-2 radio-selector">
      <input
        id="standard"
        type="checkbox"
        name="purchase-option"
        value="standard"
        class="absolute inset-0 opacity-0 peer"
        :checked="value.type === 'standard'"
        @input="setStandardPlan"
      />
      <label
        for="standard"
        :class="{
          'border-primary-darkest': value.type === 'standard',
        }"
        class="
          relative
          flex
          w-full
          px-6
          py-4
          text-sm
          transition-all
          border
          rounded
          cursor-pointer
          focus:shadow-outline
          border-primary-med
          hover:border-primary-darkest
          duration-400
          peer-checked:border-primary-darkest
        "
      >
        <span>{{
          options.standard.name ||
          $t('products.slug.purchaseOptions.standard.defaultLabel')
        }}</span>
        <span class="inline-block ml-auto font-semibold">
          <span>
            {{
              formatMoney(
                options.standard.sale
                  ? standardVariation.salePrice
                  : standardVariation.price,
                currency
              )
            }}
          </span>
          <span v-if="options.standard.sale" class="ml-2 line-through">
            {{ formatMoney(standardVariation.origPrice, currency) }}
          </span>
        </span>
      </label>
    </div>

    <!-- Subscription options -->
    <div
      v-if="hasSubscriptionPlans && selectedSubscription"
      v-click-outside="onClickOutside"
      class="relative text-sm focus:shadow-outline"
      aria-role="listbox"
      :aria-checked="value.type === 'subscription'"
    >
      <!-- Value/Toggle -->
      <button
        :id="`subscripton-dropdown-button`"
        ref="toggleDropdown"
        :class="{
          'rounded-b-none': dropdownIsActive,
          'focus:shadow-outline': !dropdownIsActive,
          'border-primary-darkest': value.type === 'subscription',
        }"
        class="
          relative
          flex
          items-center
          w-full
          py-4
          pl-6
          pr-5
          border
          rounded
          cursor-pointer
          hover:text-primary-darkest hover:border-primary-darkest
          border-primary-med
        "
        aria-label="Open plan selection dropdown"
        aria-checked="false"
        aria-haspopup="listbox"
        @click="handleSubscriptionClick"
      >
        <BaseIcon icon="uil:sync" class="mr-2" size="w-4 h-4" />
        <span class="font-normal">{{
          formatSubscriptionLabel(selectedSubscription)
        }}</span>
        <span class="inline-block ml-auto mr-2">{{
          formatSubscriptionPrice(selectedSubscription)
        }}</span>
        <div
          v-if="hasManyPlans"
          class="mt-px transition"
          :class="{ 'rotate-180': dropdownIsActive }"
        >
          <BaseIcon icon="uil:angle-down" size="sm" />
        </div>
      </button>

      <!-- Options -->
      <ul
        v-show="hasManyPlans && dropdownIsActive"
        :class="{ 'rounded-t-none': dropdownIsActive }"
        class="
          absolute
          z-10
          block
          w-full
          -mt-px
          overflow-scroll
          border
          rounded-md
          max-h-25vh
          bg-primary-lightest
          border-primary-med
        "
        aria-role="listbox"
      >
        <li
          v-for="option in options.subscription.plans"
          :id="option.id"
          :key="option.id"
          class="
            flex
            items-center
            p-2
            mx-4
            my-3
            transition
            duration-200
            rounded-md
            cursor-pointer
          "
          :class="{
            'text-primary-med': option.id === selectedSubscription.id,
            'hover:bg-primary-light': option.id !== selectedSubscription.id,
          }"
          role="option"
          @click="() => setSubscription(option)"
        >
          <span>{{ formatSubscriptionLabel(option) }}</span>
          <span class="inline-block ml-auto mr-2 font-semibold">{{
            formatSubscriptionPrice(option)
          }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
// Helpers
import { mapState } from 'vuex'

export default {
  props: {
    quantity: {
      type: Number,
      default: 1,
    },
    options: {
      type: Object,
      required: true,
    },
    optionState: {
      type: Object,
      required: false,
      default: () => {},
    },
    value: {
      type: Object,
      required: false,
      default: () => {},
    },
    product: {
      type: Object,
      required: true,
    },
  },

  data() {
    return {
      dropdownIsActive: false,
      selectedSubscription: null,
    }
  },

  computed: {
    ...mapState(['currency']),
    hasSubscriptionPlans() {
      const { subscription } = this.options
      return subscription && subscription.plans.length
    },
    hasManyPlans() {
      return (
        this.hasSubscriptionPlans && this.options.subscription.plans.length > 1
      )
    },
    standardVariation() {
      return this.$swell.products.variation(this.product, this.optionState, {
        type: 'standard',
      })
    },
  },

  watch: {
    selectedSubscription() {
      this.dropdownIsActive = false
      if (this.$refs.toggleDropdown) {
        this.$refs.toggleDropdown.focus()
      }
    },
    value: {
      handler(option) {
        if (!option || option.type !== 'subscription') return
        if (
          !this.selectedSubscription ||
          this.selectedSubscription.id !== option.plan
        ) {
          const plan = this.options.subscription.plans.find(
            (plan) => plan.id === option.plan
          )
          this.selectedSubscription = plan
        }
      },
      immediate: true,
    },
  },

  methods: {
    setSubscription(plan) {
      this.selectedSubscription = plan
      this.$emit('input', {
        type: 'subscription',
        plan: plan.id,
      })
    },
    setStandardPlan() {
      this.$emit('input', { type: 'standard' })
    },
    onClickOutside(e) {
      if (this.dropdownIsActive) {
        this.dropdownIsActive = false
      }
    },
    handleSubscriptionClick() {
      if (this.value.type === 'subscription') {
        this.dropdownIsActive = !this.dropdownIsActive
      }
      this.setSubscription(this.selectedSubscription)
    },

    formatSubscriptionLabel(option) {
      const { interval, intervalCount } = option.billingSchedule
      const intervalLabel = `products.slug.purchaseOptions.interval.${interval}.label`
      const n = intervalCount > 1 ? intervalCount : undefined
      return this.$t(
        'products.slug.purchaseOptions.interval.productsInterval',
        {
          count: this.quantity,
          n,
          interval: this.$tc(intervalLabel, intervalCount),
        }
      )
    },

    formatSubscriptionPrice(option) {
      const { interval, intervalCount } = option.billingSchedule
      const subscriptionInterval = this.$t(
        `products.slug.purchaseOptions.interval.${interval}.short`
      )

      const matchingVariation = this.$swell.products.variation(
        this.product,
        this.optionState,
        {
          type: 'subscription',
          plan: option.id,
        }
      )

      return `${this.formatMoney(
        matchingVariation.price * this.quantity,
        this.currency
      )}/${intervalCount > 1 ? intervalCount : ''}${subscriptionInterval}`
    },
  },
}
</script>
