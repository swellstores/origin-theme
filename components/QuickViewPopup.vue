<template>
  <transition name="popup" :duration="700" appear>
    <div v-if="product" class="fixed inset-0 z-40">
      <!-- Overlay -->
      <div
        class="absolute w-full h-full opacity-50 overlay bg-primary-darker"
        @click="$emit('click-close')"
      />

      <!-- Panel -->
      <div
        class="
          absolute
          bottom-0
          w-full
          overflow-x-auto overflow-y-auto
          rounded-t
          panel
          md:w-max
          h-vh-gap
          md:h-auto md:max-h-80vh md:relative md:rounded-md
          bg-primary-lightest
          md:center-xy
        "
      >
        <button
          class="
            absolute
            right-0
            z-10
            float-right
            mt-3
            mr-3
            md:float-none md:mr-6 md:mt-6
          "
          @click.prevent="
            $store.commit('setState', {
              key: 'quickViewIsVisible',
              value: false,
            })
          "
        >
          <BaseIcon icon="uil:multiply" size="sm" />
        </button>

        <div
          class="
            container
            grid grid-cols-1
            pt-3
            md:max-w-auto md:overflow-hidden md:grid-cols-2 md:p-6
          "
        >
          <!-- Product image -->
          <div class="relative mb-5 h-min md:mb-0 md:w-96 lg:w-120">
            <MediaSlider
              v-if="productImages"
              :media="product.images"
              class="h-0 md:hidden pb-full"
            />
            <!-- Fallback image -->
            <div
              v-else
              class="relative rounded md:hidden bg-primary-lighter pb-full"
            >
              <BaseIcon
                icon="uil:camera-slash"
                size="lg"
                class="absolute center-xy text-primary-med"
              />
            </div>
            <!-- Media stack for large screens -->
            <div v-if="productImages" class="hidden h-full md:block">
              <template v-for="(image, index) in productImages">
                <div v-show="index === productPreviewIndex" :key="image.id">
                  <VisualMedia
                    :id="index"
                    :source="image"
                    :alt="image.alt"
                    sizes="(min-width: 768px) 50vw, 100vw"
                  />
                </div>
              </template>

              <div class="flex mt-6 overflow-x-auto overflow-y-auto no-wrap">
                <button
                  v-for="(image, index) in product.images"
                  :key="image.id"
                  class="
                    flex-shrink-0
                    w-20
                    h-20
                    p-2
                    mr-2
                    transition
                    duration-300
                    rounded
                    hover:border-primary-med
                    ease
                  "
                  :class="{
                    'border border-primary-darkest':
                      index === productPreviewIndex,
                    'border border-primary-lighter':
                      index !== productPreviewIndex,
                  }"
                  @click="setProductPreview(index)"
                >
                  <VisualMedia
                    :source="image"
                    :alt="image.alt"
                    sizes="(min-width: 768px) 120px"
                  />
                </button>
              </div>
            </div>
            <!-- Fallback image -->
            <div v-else class="relative rounded bg-primary-lighter pb-full">
              <BaseIcon
                icon="uil:camera-slash"
                size="lg"
                class="absolute center-xy text-primary-med"
              />
            </div>
          </div>

          <!-- Product details -->
          <div class="relative pb-6 md:pb-0 md:ml-5">
            <div class="relative h-full md:overflow-y-auto md:overflow-x-auto">
              <div class="relative w-full px-1 md:absolute">
                <h2 class="mb-4 leading-tight">
                  {{ product.name }}
                </h2>
                <NuxtLink
                  class="inline-block mb-5 underline"
                  :to="
                    localePath(
                      resolveUrl({ type: 'product', value: product.slug })
                    )
                  "
                >
                  View full details
                </NuxtLink>

                <!-- Bundle items -->
                <template v-if="bundleItems">
                  <div
                    class="my-8 border-b border-primary-med"
                    :class="{ 'hidden md:block': bundleItems.length > 3 }"
                  >
                    <h2 class="text-xl">
                      {{ $t('products.slug.bundle.title') }}
                    </h2>

                    <ProductBundleItem
                      v-for="(item, index) in bundleItems"
                      ref="bundleItem"
                      :key="'bundleItem' + index"
                      class="border-b border-primary-light last:border-b-0"
                      :item="item"
                      :option-state="bundleItemsOptionState"
                      @check-availability="checkBundleItemAvailability"
                      @value-changed="setBundleItemOptionValue"
                    />
                  </div>

                  <div v-if="bundleItems.length > 3" class="block md:hidden">
                    <AccordionItem
                      ref="bundleItemAccordion"
                      :heading="$t('products.slug.bundle.title')"
                    >
                      <ProductBundleItem
                        v-for="(item, index) in bundleItems"
                        ref="bundleItem"
                        :key="'bundleItem' + index"
                        :class="{
                          'border-b border-primary-light':
                            index + 1 < bundleItems.length,
                        }"
                        :item="item"
                        :option-state="bundleItemsOptionState"
                        @check-availability="checkBundleItemAvailability"
                        @value-changed="setBundleItemOptionValue"
                      />
                    </AccordionItem>
                  </div>
                </template>

                <!-- Product options -->
                <div
                  v-for="input in optionInputs"
                  :key="input.name"
                  class="my-8"
                >
                  <component
                    :is="input.component"
                    v-if="visibleOptionIds.includes(input.option.id)"
                    :option="input.option"
                    :current-value="optionState[input.option.name]"
                    :validation="$v.optionState[input.option.name]"
                    @value-changed="setOptionValue"
                  />
                </div>

                <ProductPurchaseOptions
                  v-if="product.purchaseOptions"
                  v-model="selectedPurchaseOption"
                  :options="product.purchaseOptions"
                  :option-state="optionState"
                  :product="product"
                  :quantity="quantity"
                  class="mb-8"
                />

                <!-- Duplicate button element to match fixed button height -->
                <div class="opacity-0 pointer-events-none">
                  <span
                    v-if="product.stockTracking && !product.stockPurchasable"
                    class="block mb-3"
                    >|</span
                  >
                  <button
                    :class="{ loading: cartIsUpdating }"
                    type="submit"
                    class="relative w-full btn btn--lg"
                  >
                    |
                  </button>
                </div>
              </div>
            </div>
            <!-- Cart button & stock info -->
            <div
              v-if="variation"
              class="
                container
                fixed
                bottom-0
                pt-4
                center-x
                bg-primary-lightest
                md:px-0 md:w-full md:absolute
              "
            >
              <StockStatus
                v-if="product.stockTracking && !product.stockPurchasable"
                :status-value="variation.stockStatus"
                :bundle-items-available="bundleItemsAvailable"
                :stock-level="variation.stockLevel"
                :show-stock-level="showStockLevel"
              />

              <!-- Quantity -->
              <div class="flex">
                <ProductQuantity
                  v-if="enableQuantity"
                  v-model="quantity"
                  :initial-limit="maxQuantity"
                  :stock-tracking="variation.stockTracking"
                  :stock-purchasable="variation.stockPurchasable"
                  :stock-level="variation.stockLevel"
                />

                <!-- Add to cart -->
                <button
                  :class="{
                    loading: cartIsUpdating,
                    disabled: !available,
                  }"
                  type="submit"
                  class="btn btn--lg relative w-full h-auto"
                  :disabled="!available"
                  @click.prevent="addToCart"
                >
                  <div v-show="!cartIsUpdating">
                    <span>{{ $t('products.slug.addToCart') }}</span>
                    <span
                      class="
                        inline-block
                        w-5
                        mx-1
                        mb-1
                        border-b border-primary-lightest
                      "
                    />
                    <span>{{
                      formatMoney(variation.price * quantity, currency)
                    }}</span>
                    <span v-if="billingInterval">{{ billingInterval }}</span>
                    <span
                      v-if="variation.origPrice"
                      class="ml-1 line-through text-primary-med"
                    >
                      {{
                        formatMoney(variation.origPrice * quantity, currency)
                      }}
                    </span>
                    <span
                      v-if="
                        selectedPurchaseOption &&
                        selectedPurchaseOption.type === 'subscription'
                      "
                      class="lowercase"
                    >
                      /
                      {{ intervalCount }}{{ subscriptionInterval }}
                    </span>
                  </div>
                  <div v-show="cartIsUpdating" class>
                    <div class="absolute inset-0 mt-3 spinner" />
                    <span class="absolute inset-0 mt-5">{{
                      $t('products.slug.updating')
                    }}</span>
                  </div>
                </button>
              </div>

              <div class="h-6 bg-primary-lightest md:hidden" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
// Helpers
import get from 'lodash/get'
import { validationMixin } from 'vuelidate'
import { required } from 'vuelidate/lib/validators'
import { mapState } from 'vuex'
import { listVisibleOptions } from '~/modules/swell'
import { getInitialSelection } from '~/utils/purchaseOptions'

export default {
  mixins: [validationMixin],

  props: {
    productId: {
      type: String,
      default: null,
    },
  },

  data() {
    return {
      product: null,
      quantity: 1,
      enableQuantity: true,
      maxQuantity: 99,
      pendingState: false,
      bundleItemsOptionState: null,
      bundleItemsAvailable: true,
      optionState: null,
      productPreviewIndex: 0,
      showStockLevel: true,
      activeDropdownUID: null,
      selectedPurchaseOption: null,
    }
  },
  async fetch() {
    const { $swell } = this

    // Fetch product
    const product = await $swell.products.get(this.productId)

    // Compute initial values for options
    const optionState =
      this.optionState ||
      (product.options || []).reduce((options, { name, values, inputType }) => {
        // Set first available value for select current option
        if (!inputType || inputType === 'select') {
          options[name] = get(values, '0.name')
        }
        return options
      }, {})

    if (product.bundle && product.bundleItems?.length) {
      const bundleItemsOptionState = product.bundleItems.map((item) => {
        let optionState = []
        if (item.options?.length) {
          optionState = item.options.reduce((options, { name, value }) => {
            options.push({ name, value })
            return options
          }, [])
        } else {
          optionState = item.product.options.reduce(
            (options, { name, values, inputType }) => {
              // Set first available value for select current option
              let defaultValue = null
              if (!inputType || inputType === 'select') {
                defaultValue = get(values, '0.name')
              }
              options.push({ name, value: defaultValue })
              return options
            },
            []
          )
        }

        return {
          productId: item.productId,
          options: optionState,
        }
      })

      this.bundleItemsOptionState = bundleItemsOptionState
    }
    let maxQuantity = get(product, 'content.maxQuantity')
    maxQuantity = !maxQuantity
      ? 99
      : typeof maxQuantity === 'string'
      ? Number(maxQuantity)
      : 99
    maxQuantity = !isNaN(maxQuantity) ? maxQuantity : 99

    this.selectedPurchaseOption = getInitialSelection(product.purchaseOptions)

    // Set component data
    this.product = product
    this.optionState = optionState
    this.showStockLevel = get(product, 'content.showStockLevel')
    this.enableQuantity = get(product, 'content.enableQuantity')
    this.maxQuantity = maxQuantity
  },

  computed: {
    ...mapState(['currency', 'cartIsUpdating']),

    // Resulting combination of selected product options
    variation() {
      if (!this.product) return {}
      return this.$swell.products.variation(this.product, this.optionState)
    },

    bundleItems() {
      if (!this.product.bundle && !this.product.bundleItems?.length) return null
      return this.product.bundleItems
    },

    available() {
      const { stockStatus, stockTracking, stockPurchasable } = this.variation

      if (!this.bundleItemsAvailable) return false

      return (
        (stockStatus && stockStatus !== 'out_of_stock') ||
        !stockTracking ||
        stockPurchasable
      )
    },

    productImages() {
      if (!this.product?.images?.length) return null
      return this.product.images
    },

    billingInterval() {
      return get(this, 'optionState.Plan')
    },

    optionInputs() {
      const options = get(this, 'product.options', [])

      return options.reduce((optionInputs, option) => {
        let componentName

        switch (option.inputType) {
          case 'short_text':
            componentName = 'Text'
            break
          case 'long_text':
            componentName = 'Text'
            break
          case 'toggle':
            componentName = 'Checkbox'
            break
          default:
            componentName = 'Select'
        }

        // Don't include subscription plan if there's only one option value available
        if (option.subscription && option.values.length < 2) return optionInputs

        optionInputs.push({
          option,
          component: () => import(`./ProductOption${componentName}.vue`),
        })

        return optionInputs
      }, [])
    },

    visibleOptionIds() {
      const options = get(this, 'product.options', [])
      const optionState = this.optionState

      return listVisibleOptions(options, optionState).map(({ id }) => id)
    },

    intervalData() {
      if (
        !this.selectedPurchaseOption ||
        this.selectedPurchaseOption.type !== 'subscription'
      ) {
        return
      }

      // Placeholder until swell-js provides interval data inside variation()
      const currentPlan = this.product.purchaseOptions.subscription.plans.find(
        (plan) => plan.id === this.selectedPurchaseOption.plan
      )

      const { interval, intervalCount } = currentPlan.billingSchedule

      return { interval, intervalCount }
    },

    intervalCount() {
      if (!this.intervalData) return
      const { intervalCount } = this.intervalData
      return intervalCount > 1 ? intervalCount : ''
    },

    subscriptionInterval() {
      if (!this.intervalData) return
      return this.$t(
        `products.slug.purchaseOptions.interval.${this.intervalData.interval}.short`
      )
    },
  },

  methods: {
    // Determine whether to disable Add to Cart button based on the variant's stock status
    disableOnVariantStockStatus(stockStatus) {
      return (
        (stockStatus === 'out_of_stock' || !stockStatus) &&
        this.product.stockTracking &&
        !this.product.stockPurchasable
      )
    },

    // Update an option value based on user input
    setOptionValue({ option, value }) {
      // Use $set to update the data object because options are dynamic
      // and optionState won't be reactive otherwise
      // TODO in Vue 3 this.optionState[option] = value should work
      this.$set(this.optionState, option, value)
    },

    // Update a bundle item's option value based on user input
    setBundleItemOptionValue({ option, value, productId }) {
      if (!this.bundleItemsOptionState) return null

      const bundleItemOptionState = [...this.bundleItemsOptionState]
      const itemIndex = bundleItemOptionState.findIndex(
        (item) => item.productId === productId
      )
      const optionIndex = bundleItemOptionState[itemIndex].options.findIndex(
        (opt) => opt.name === option
      )

      bundleItemOptionState[itemIndex].options[optionIndex].value = value

      this.bundleItemsOptionState = bundleItemOptionState
    },

    checkBundleItemAvailability() {
      if (this.bundleItems && this.$refs.bundleItem) {
        this.bundleItemsAvailable = this.$refs.bundleItem.every(
          (item) => item.available
        )
      }
      return true
    },

    // Set product preview
    setProductPreview(index) {
      this.productPreviewIndex = index
    },

    // Add product to cart with selected options
    async addToCart() {
      try {
        // Touch and validate all fields
        this.$v.$touch()
        if (this.$v.$invalid) return // return if invalid

        // Validate bundle item fields if they exist
        if (this.bundleItems && this.$refs.bundleItem?.length) {
          this.$refs.bundleItem.forEach(({ $v }) => $v.$touch())
          const bundleItemsValid = this.$refs.bundleItem.every(
            ({ $v }) => !$v.$invalid
          )

          // If on smaller device, expand accordion if validation fails
          const accordion = this.$refs.bundleItemAccordion
          if (accordion && !accordion.isExpanded) {
            accordion.toggleExpanded()
          }

          if (!bundleItemsValid) return

          await this.$store.dispatch('addCartItem', {
            productId: this.variation.id,
            quantity: this.quantity || 1,
            options: this.optionState,
            purchaseOption: this.selectedPurchaseOption,
            bundleItems: this.bundleItemsOptionState,
          })
        } else {
          await this.$store.dispatch('addCartItem', {
            productId: this.variation.id,
            quantity: this.quantity || 1,
            purchaseOption: this.selectedPurchaseOption,
            options: this.optionState,
          })
        }

        // Close popup when product has been added to cart
        this.$emit('click-close')
      } catch (err) {
        if (err.message === 'invalid_stock') {
          this.$store.dispatch('showNotification', {
            message: this.$t('cart.exceedsStockLevel'),
            type: 'error',
          })
        }
      }
    },
  },

  validations() {
    const options = get(this, 'product.options', [])
    const fields = options.reduce((obj, option) => {
      if (option.required) {
        obj[option.name] = { required }
      }
      return obj
    }, {})

    return {
      optionState: fields,
    }
  },
}
</script>

<style lang="postcss">
.gradient {
  @apply w-full absolute top-0 h-6 transform -translate-y-full;
  background: rgb(255, 255, 255);
  background: linear-gradient(
    0deg,
    theme('colors.primary.lighter') 0%,
    theme('colors.primary.lighter') 25%,
    rgba(255, 255, 255, 0) 100%
  );
}
</style>
