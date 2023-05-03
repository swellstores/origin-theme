<template>
  <transition name="popup" :duration="700" appear>
    <div v-if="product" class="fixed inset-0 z-40">
      <!-- Overlay -->
      <div
        class="overlay absolute h-full w-full bg-primary-darker opacity-50"
        @click="$emit('click-close')"
      />

      <!-- Panel -->
      <div
        class="panel h-vh-gap md:center-xy absolute bottom-0 w-full overflow-x-auto overflow-y-auto rounded-t bg-primary-lightest md:relative md:h-auto md:max-h-80vh md:w-max md:rounded-md"
      >
        <button
          class="absolute right-0 z-10 float-right mt-3 mr-3 md:float-none md:mr-6 md:mt-6"
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
          class="md:max-w-auto container grid grid-cols-1 pt-3 md:grid-cols-2 md:overflow-hidden md:p-6"
        >
          <!-- Product image -->
          <div class="relative mb-5 h-min md:mb-0 md:w-96 lg:w-120">
            <MediaSlider
              v-if="productImages"
              :media="product.images"
              class="h-0 pb-full md:hidden"
            />
            <!-- Fallback image -->
            <div
              v-else
              class="relative rounded bg-primary-lighter pb-full md:hidden"
            >
              <BaseIcon
                icon="uil:camera-slash"
                size="lg"
                class="center-xy absolute text-primary-med"
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

              <div class="no-wrap mt-6 flex overflow-x-auto overflow-y-auto">
                <button
                  v-for="(image, index) in product.images"
                  :key="image.id"
                  class="ease mr-2 h-20 w-20 flex-shrink-0 rounded p-2 transition duration-300 hover:border-primary-med"
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
                class="center-xy absolute text-primary-med"
              />
            </div>
          </div>

          <!-- Product details -->
          <div class="relative pb-6 md:ml-5 md:pb-0">
            <div class="relative h-full md:overflow-x-auto md:overflow-y-auto">
              <div class="relative w-full px-1 md:absolute">
                <h2 class="mb-4 leading-tight">
                  {{ product.name }}
                </h2>
                <NuxtLink
                  class="mb-5 inline-block underline"
                  :to="
                    localePath(
                      resolveUrl({ type: 'product', value: product.slug }),
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
                      {{ $t('products._slug.bundle.title') }}
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
                      :heading="$t('products._slug.bundle.title')"
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
                    v-if="
                      optionState[input.option.id] &&
                      optionState[input.option.id].isVisible
                    "
                    :option="input.option"
                    :current-value="optionState[input.option.id].value"
                    :active-dropdown-u-i-d="activeDropdownUID"
                    :validation="$v.selectedOptions[input.option.name]"
                    @value-changed="
                      (args) =>
                        setOptionValue({ ...args, optionId: input.option.id })
                    "
                    @dropdown-active="setActiveDropdownUID($event)"
                  />
                </div>

                <ProductPurchaseOptions
                  v-if="product.purchaseOptions"
                  v-model="selectedPurchaseOption"
                  :options="product.purchaseOptions"
                  :option-state="selectedOptions"
                  :product="product"
                  :quantity="quantity"
                  class="mb-8"
                />

                <!-- Duplicate button element to match fixed button height -->
                <div class="pointer-events-none opacity-0">
                  <span
                    v-if="product.stockTracking && !product.stockPurchasable"
                    class="mb-3 block"
                    >|</span
                  >
                  <button
                    :class="{ loading: cartIsUpdating }"
                    type="submit"
                    class="btn btn--lg relative w-full"
                  >
                    |
                  </button>
                </div>
              </div>
            </div>
            <!-- Cart button & stock info -->
            <div
              v-if="variation"
              class="center-x container fixed bottom-0 bg-primary-lightest pt-4 md:absolute md:w-full md:px-0"
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
                  class="btn btn--lg relative h-auto w-full"
                  :disabled="!available"
                  @click.prevent="addToCart"
                >
                  <div v-show="!cartIsUpdating">
                    <template v-if="product.price !== null">
                      <span>{{ $t('products._slug.addToCart') }}</span>
                      <span
                        class="mx-1 mb-1 inline-block w-5 border-b border-primary-lightest"
                      />
                      <span>{{
                        formatMoney(variation.price * quantity, currency, false)
                      }}</span>
                      <span v-if="billingInterval">{{ billingInterval }}</span>
                      <span
                        v-if="variation.origPrice"
                        class="ml-1 text-primary-med line-through"
                      >
                        {{
                          formatMoney(
                            variation.origPrice * quantity,
                            currency,
                            false,
                          )
                        }}
                      </span>
                      <span
                        v-if="
                          selectedPurchaseOption &&
                          selectedPurchaseOption.type === 'subscription'
                        "
                        class="lowercase"
                      >
                        / {{ intervalCount }}{{ subscriptionInterval }}
                      </span>
                    </template>
                    <template v-else>
                      <span>{{
                        $t('products._slug.addToCart.unavailableInCurrency', {
                          currency,
                        })
                      }}</span>
                    </template>
                  </div>
                  <div v-show="cartIsUpdating" class>
                    <div class="spinner absolute inset-0 mt-3" />
                    <span class="absolute inset-0 mt-5">{{
                      $t('products._slug.updating')
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
import { validationMixin } from 'vuelidate';
import { required } from 'vuelidate/lib/validators';
import { mapState } from 'vuex';
import get from 'lodash/get';

import { listVisibleOptions } from '~/modules/swell/utils/listVisibleOptions';
import { getVariantOptionIds } from '~/modules/swell/utils/getVariantOptionIds';
import { getInitialSelection } from '~/utils/purchaseOptions';

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
      /**
       * Option state with initial values.
       * @type { { [id: string]: { name: string, value: string, isVisible: boolean } } }
       */
      optionState: {},
      productPreviewIndex: 0,
      showStockLevel: true,
      activeDropdownUID: null,
      selectedPurchaseOption: null,
    };
  },
  async fetch() {
    const { $swell } = this;

    // Fetch product
    const product = await $swell.products.get(this.productId);

    if (product.bundle && product.bundleItems?.length) {
      const bundleItemsOptionState = product.bundleItems.map((item) => {
        let optionState = [];
        if (item.options?.length) {
          optionState = item.options.reduce((options, { name, value }) => {
            options.push({ name, value });
            return options;
          }, []);
        } else {
          optionState = item.product.options.reduce(
            (options, { name, values, inputType }) => {
              // Set first available value for select current option
              let defaultValue = null;
              if (!inputType || inputType === 'select') {
                defaultValue = get(values, '0.name');
              }
              options.push({ name, value: defaultValue });
              return options;
            },
            [],
          );
        }

        return {
          id: item.id,
          productId: item.productId,
          options: optionState,
        };
      });

      this.bundleItemsOptionState = bundleItemsOptionState;
    }
    let maxQuantity = get(product, 'content.maxQuantity');
    maxQuantity = !maxQuantity
      ? 99
      : typeof maxQuantity === 'string'
      ? Number(maxQuantity)
      : 99;
    maxQuantity = !isNaN(maxQuantity) ? maxQuantity : 99;

    this.selectedPurchaseOption = getInitialSelection(product.purchaseOptions);

    // Set component data
    this.product = product;
    this.optionState = this.getInitialOptions(product);
    this.showStockLevel = get(product, 'content.showStockLevel');
    this.enableQuantity = get(product, 'content.enableQuantity');
    this.maxQuantity = maxQuantity;
  },

  computed: {
    ...mapState(['currency', 'cartIsUpdating']),

    // Resulting combination of selected product options
    variation() {
      if (!this.product) return {};
      return this.$swell.products.variation(this.product, this.selectedOptions);
    },

    activeVariantOptionIds() {
      return getVariantOptionIds(this.product?.variants?.results);
    },

    bundleItems() {
      if (!this.product.bundle && !this.product.bundleItems?.length)
        return null;
      return this.product.bundleItems;
    },

    available() {
      const { stockStatus, stockTracking, stockPurchasable } = this.variation;

      if (!this.bundleItemsAvailable || this.product.price === null)
        return false;

      return (
        (stockStatus && stockStatus !== 'out_of_stock') ||
        !stockTracking ||
        stockPurchasable
      );
    },

    productImages() {
      if (!this.product?.images?.length) return null;
      return this.product.images;
    },

    billingInterval() {
      return get(this, 'selectedOptions.Plan');
    },

    optionInputs() {
      const options = get(this, 'product.options', []);
      const hasSingleSelectOption =
        options.length === 1 && options[0].inputType === 'select';

      return options.reduce((optionInputs, option) => {
        let componentName;

        switch (option.inputType) {
          case 'short_text':
            componentName = 'Text';
            break;
          case 'long_text':
            componentName = 'Text';
            break;
          case 'toggle':
            componentName = 'Checkbox';
            break;
          default:
            componentName = 'Select';
        }

        // Don't include subscription plan if there's only one option value available
        if (option.subscription && option.values.length < 2)
          return optionInputs;

        // If this is the only singular option, only show values that will result in an active variant
        if (hasSingleSelectOption) {
          const activeValues = option.values.filter((value) =>
            this.activeVariantOptionIds.has(value.id),
          );
          option.values = activeValues;
        }

        optionInputs.push({
          option,
          component: () => import(`./ProductOption${componentName}.vue`),
        });

        return optionInputs;
      }, []);
    },

    /**
     * Formatted optionState in a swell-js-compatible structure
     * @type { { [name: string]: string } }
     */
    selectedOptions() {
      return this.normalizeOptions(this.optionState);
    },

    intervalData() {
      if (
        !this.selectedPurchaseOption ||
        this.selectedPurchaseOption.type !== 'subscription'
      ) {
        return;
      }

      // Placeholder until swell-js provides interval data inside variation()
      const currentPlan = this.product.purchaseOptions.subscription.plans.find(
        (plan) => plan.id === this.selectedPurchaseOption.plan,
      );

      const { interval, intervalCount } = currentPlan.billingSchedule;

      return { interval, intervalCount };
    },

    intervalCount() {
      if (!this.intervalData) return;
      const { intervalCount } = this.intervalData;
      return intervalCount > 1 ? intervalCount : '';
    },

    subscriptionInterval() {
      if (!this.intervalData) return;
      return this.$t(
        `products._slug.purchaseOptions.interval.${this.intervalData.interval}.short`,
      );
    },
  },

  methods: {
    // Determine whether to disable Add to Cart button based on the variant's stock status
    disableOnVariantStockStatus(stockStatus) {
      return (
        (stockStatus === 'out_of_stock' || !stockStatus) &&
        this.product.stockTracking &&
        !this.product.stockPurchasable
      );
    },

    // Update an option value based on user input
    setOptionValue({ optionId, option: name, value }) {
      // Get the option from optionState whose value is being updated.
      const option = this.optionState[optionId] || {};
      // Update its properties based on input
      const updatedOption = { ...option, name, value };
      // Create a copy of optionState with this option updated
      const optionState = { ...this.optionState, [optionId]: updatedOption };

      const productOptions = this.product.options || [];
      const visibleOptions = listVisibleOptions(
        productOptions,
        this.normalizeOptions(optionState, false),
      ).map(({ id }) => id);

      // Update optionState with the updated option and recalculated visibility properties
      this.optionState = this.markVisibleOptions(optionState, visibleOptions);
    },

    getInitialOptions(product) {
      if (!product) return;
      const productOptions = product.options || [];

      /**
       * Option state with initial values for selects.
       * @type { { [id: string]: { name: string, value: string, isVisible: boolean } } }
       */
      const optionState = productOptions.reduce(
        (optionsAcc, { id, name, required, values, inputType }) => {
          const option = { name, required, isVisible: false };
          if (!inputType || inputType === 'select') {
            const isSingleSelectOption = productOptions.length === 1;
            // If this is the only select option, only include values that result in an active variant
            if (isSingleSelectOption) {
              const activeValues = values.filter((value) =>
                this.activeVariantOptionIds.has(value.id),
              );
              optionsAcc[id] = { ...option, value: activeValues[0].name };
            } else {
              // Use first available value as the default value for selects
              optionsAcc[id] = { ...option, value: values[0].name };
            }
          } else {
            optionsAcc[id] = option;
          }
          return optionsAcc;
        },
        {},
      );

      /**
       * Normalized optionState in a swell-js-compatible structure
       * @type { { [name: string]: string } }
       */
      const initialSelection = this.normalizeOptions(optionState, false);

      const visibleOptions = listVisibleOptions(
        productOptions,
        initialSelection,
      ).map(({ id }) => id);

      // Return optionState with visible options marked as such
      return this.markVisibleOptions(optionState, visibleOptions);
    },

    normalizeOptions(optionState, checkVisibility = true) {
      return Object.values(optionState).reduce(
        (acc, { name, value, isVisible }) => {
          if (!checkVisibility || (checkVisibility && isVisible)) {
            if (name && value) acc[name] = value;
          }
          return acc;
        },
        {},
      );
    },

    markVisibleOptions(optionState, visibleOptions) {
      Object.keys(optionState).forEach((key) => {
        if (visibleOptions.includes(key)) {
          optionState[key].isVisible = true;
        } else {
          optionState[key].isVisible = false;
        }
      });
      return optionState;
    },

    // Update a bundle item's option value based on user input
    setBundleItemOptionValue({ option, value, productId }) {
      if (!this.bundleItemsOptionState) return null;

      const bundleItemOptionState = [...this.bundleItemsOptionState];
      const itemIndex = bundleItemOptionState.findIndex(
        (item) => item.productId === productId,
      );
      const optionIndex = bundleItemOptionState[itemIndex].options.findIndex(
        (opt) => opt.name === option,
      );

      bundleItemOptionState[itemIndex].options[optionIndex].value = value;

      this.bundleItemsOptionState = bundleItemOptionState;
    },

    checkBundleItemAvailability() {
      if (this.bundleItems && this.$refs.bundleItem) {
        this.bundleItemsAvailable = this.$refs.bundleItem.every(
          (item) => item.available,
        );
      }
      return true;
    },

    // Set product preview
    setProductPreview(index) {
      this.productPreviewIndex = index;
    },

    // Add product to cart with selected options
    async addToCart() {
      try {
        // Touch and validate all fields
        this.$v.$touch();
        if (this.$v.$invalid) return; // return if invalid

        // Validate bundle item fields if they exist
        if (this.bundleItems && this.$refs.bundleItem?.length) {
          this.$refs.bundleItem.forEach(({ $v }) => $v.$touch());
          const bundleItemsValid = this.$refs.bundleItem.every(
            ({ $v }) => !$v.$invalid,
          );

          // If on smaller device, expand accordion if validation fails
          const accordion = this.$refs.bundleItemAccordion;
          if (accordion && !accordion.isExpanded) {
            accordion.toggleExpanded();
          }

          if (!bundleItemsValid) return;

          await this.$store.dispatch('addCartItem', {
            productId: this.variation.id,
            quantity: this.quantity || 1,
            options: this.selectedOptions,
            purchaseOption: this.selectedPurchaseOption,
            bundleItems: this.bundleItemsOptionState,
          });
        } else {
          await this.$store.dispatch('addCartItem', {
            productId: this.variation.id,
            quantity: this.quantity || 1,
            purchaseOption: this.selectedPurchaseOption,
            options: this.selectedOptions,
          });
        }

        // Close popup when product has been added to cart
        this.$emit('click-close');
      } catch (err) {
        if (err.message === 'invalid_stock') {
          this.$store.dispatch('showNotification', {
            message: this.$t('cart.exceedsStockLevel'),
            type: 'error',
          });
        }
      }
    },
  },

  validations() {
    const fields = Object.values(this.optionState).reduce((acc, option) => {
      if (option.isVisible && option.required) {
        acc[option.name] = { required };
      }
      return acc;
    }, {});

    return {
      selectedOptions: fields,
    };
  },
};
</script>

<style lang="postcss">
.gradient {
  background: rgb(255 255 255);
  background: linear-gradient(
    0deg,
    theme('colors.primary.lighter') 0%,
    theme('colors.primary.lighter') 25%,
    rgba(255 255 255 / 0%) 100%
  );
  @apply absolute top-0 h-6 w-full -translate-y-full transform;
}
</style>
