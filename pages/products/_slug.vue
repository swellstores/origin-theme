<template>
  <main>
    <!-- Core product content -->
    <section class="mb-12 md:flex">
      <div class="relative md:w-1/2">
        <!-- Media slider for small screens -->
        <MediaSlider
          v-if="productImages"
          :media="productImages"
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
        <div class="hidden h-full md:block">
          <div v-if="$fetchState.pending" class="h-full bg-primary-lighter" />
          <template v-else>
            <div v-if="productImages">
              <VisualMedia
                v-for="(image, index) in productImages"
                :key="image.id"
                :source="image"
                :alt="image.alt"
                :lazy-load="index > 0"
                sizes="(min-width: 768px) 50vw, 100vw"
              />
            </div>

            <!-- Fallback image -->
            <div v-else class="relative rounded bg-primary-lighter pb-full">
              <BaseIcon
                icon="uil:camera-slash"
                size="lg"
                class="center-xy absolute text-primary-med"
              />
            </div>
          </template>
        </div>

        <!-- Back button -->
        <a
          href="#"
          class="fixed left-6 bottom-6 flex h-9 w-9 items-center justify-center rounded-full bg-primary-lighter shadow-md"
          @click.prevent="navigateBack"
        >
          <BaseIcon icon="uil:angle-left" class="-ml-px" />
        </a>
      </div>

      <!-- Product overview -->
      <div class="md:w-1/2 lg:px-6 xl:px-12">
        <div
          class="container top-0 max-w-160 pt-10 transition-all duration-300 ease-in-out md:sticky md:pt-12"
          :class="headerIsVisible ? 'top-20' : 'top-0'"
        >
          <!-- Skeleton loader -->
          <div v-if="$fetchState.pending">
            <div class="loader-el mb-4 h-3 w-32" />
            <div class="loader-el mb-7 h-9 w-2/3" />
            <div class="loader-el mb-4 h-3 w-40" />
            <div class="loader-el mb-12 h-4 w-20" />
            <div
              v-for="index in 7"
              :key="`skeleton-1-${index}`"
              :style="`width: ${100 - Math.random() * 20}%`"
              class="loader-el mb-4 h-2"
            />
            <div class="mt-12 mb-4 flex justify-between">
              <div class="loader-el h-3 w-24" />
              <div class="loader-el h-3 w-48" />
            </div>
            <div class="loader-el mb-10 h-12" />
            <div
              v-for="index in 3"
              :key="`skeleton-2-${index}`"
              class="mb-2 flex items-center"
            >
              <div class="loader-el mr-2 h-5 w-5 rounded-full" />
              <div
                :style="`width: ${80 - Math.random() * 30}%`"
                class="loader-el h-2"
              />
            </div>
          </div>

          <!-- Main content -->
          <div v-else>
            <!--TODO<div class="mb-2 label-xs-bold text-primary-dark">{{ breadcrumb }}</div>-->
            <h1 class="mb-4 leading-tight">
              {{ product.name }}
            </h1>
            <!--TODO awaiting customer reviews feature
            <ReviewStars :score="reviews.averageScore" size="sm" />
            <span class="text-sm">{{ reviews.total }} reviews</span>
            -->
            <div
              class="mt-2 mb-5 flex items-center text-lg font-semibold md:mb-8"
            >
              <span
                v-if="
                  variation.price !== null &&
                  variation.price >= 0 &&
                  variationCurrency === currency
                "
                >{{ formatMoney(variation.price, currency, false) }}</span
              >
              <span v-else>{{
                $t('products._slug.unavailableInCurrency', {
                  currency,
                })
              }}</span>
              <span v-if="billingInterval" class="lowercase"
                >&nbsp;{{ billingInterval }}</span
              >
              <span
                v-if="variation.origPrice"
                class="ml-3 -mt-2px inline-block h-6 rounded bg-error-faded px-2 text-xs uppercase leading-loose text-error-default"
              >
                {{ $t('products._slug.save') }}
                {{
                  formatMoney(
                    variation.origPrice - variation.price,
                    currency,
                    false,
                  )
                }}
              </span>
            </div>
            <div class="markdown" v-html="product.description" />

            <!-- Bundle items -->
            <template v-if="bundleItems">
              <div
                class="my-8 border-b border-primary-med"
                :class="{ 'hidden md:block': bundleItems.length > 3 }"
              >
                <h2 class="text-xl">{{ $t('products._slug.bundle.title') }}</h2>

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
                    class="border-b border-primary-light last:border-b-0"
                    :item="item"
                    :option-state="bundleItemsOptionState"
                    @check-availability="checkBundleItemAvailability"
                    @value-changed="setBundleItemOptionValue"
                  />
                </AccordionItem>
              </div>
            </template>

            <!-- Product options -->
            <div v-for="input in optionInputs" :key="input.name" class="my-8">
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
            <!-- Purchase options -->
            <ProductPurchaseOptions
              v-if="product.purchaseOptions && variationCurrency === currency"
              v-model="selectedPurchaseOption"
              :options="product.purchaseOptions"
              :option-state="selectedOptions"
              :product="product"
              :quantity="quantity"
            />

            <!-- Cart button & stock info -->
            <div v-if="variation" class="relative my-8">
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
                  v-if="
                    enableQuantity &&
                    selectedPurchaseOption &&
                    selectedPurchaseOption.type === 'standard'
                  "
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
                    <template
                      v-if="
                        variation.price !== null &&
                        variation.price >= 0 &&
                        variationCurrency === currency
                      "
                    >
                      <span>{{ $t('products._slug.addToCart') }}</span>
                      <span class="hidden sm:inline">
                        <span
                          class="mx-1 mb-1 inline-block w-5 border-b border-primary-lightest"
                        />
                        <span>{{
                          formatMoney(
                            variation.price * quantity,
                            currency,
                            false,
                          )
                        }}</span>
                        <span v-if="billingInterval">{{
                          billingInterval
                        }}</span>
                        <span
                          v-if="
                            variation.origPrice &&
                            !(
                              selectedPurchaseOption &&
                              selectedPurchaseOption.type === 'subscription'
                            )
                          "
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
                      </span>
                    </template>
                    <template v-else>
                      <span>{{
                        $t('products._slug.unavailableInCurrencyAddToCart', {
                          currency,
                        })
                      }}</span>
                    </template>
                  </div>
                  <div v-show="cartIsUpdating">
                    <div class="spinner absolute inset-0 mt-3" />
                    <span>{{ $t('products._slug.updating') }}</span>
                  </div>
                </button>
              </div>
            </div>
            <!-- END Purchase form -->

            <!-- Store features -->
            <div class="my-8">
              <ul class>
                <li
                  v-for="(benefit, index) in productBenefits"
                  :key="'storeProductBenefit' + index"
                  class="label-sm my-2 flex"
                >
                  <BaseIcon :icon="benefit.icon" size="sm" class="mr-2 -mb-1" />
                  <span>{{ benefit.text }}</span>
                </li>
              </ul>
            </div>

            <!-- Details & attributes -->
            <div v-for="attribute in product.attributes" :key="attribute.id">
              <template v-if="attribute.visible">
                <component
                  :is="getAttributeComponent(attribute.type)"
                  :attribute="attribute"
                  :currency="currency"
                />
              </template>
            </div>

            <!-- Share product -->
            <div v-if="enableSocialSharing" class="flex-no-wrap flex py-3">
              <strong class="w-1/4 pr-6 text-primary-darkest">{{
                $t('products._slug.share')
              }}</strong>
              <div class="flex w-3/4 justify-end">
                <SocialShare
                  class="mr-2 cursor-pointer"
                  network="facebook"
                  :url="pageMeta.url"
                  :title="pageMeta.title"
                  :description="pageMeta.description"
                >
                  <BaseIcon icon="mdi:facebook" />
                </SocialShare>

                <SocialShare
                  class="mr-2 cursor-pointer"
                  network="twitter"
                  :url="pageMeta.url"
                  :title="pageMeta.title"
                  :description="pageMeta.description"
                >
                  <BaseIcon icon="mdi:twitter" />
                </SocialShare>

                <SocialShare
                  class="mr-2 cursor-pointer"
                  network="pinterest"
                  :url="pageMeta.url"
                  :description="pageMeta.description"
                  :media="pageMeta.image"
                >
                  <BaseIcon icon="mdi:pinterest" />
                </SocialShare>

                <SocialShare
                  class="cursor-pointer"
                  network="email"
                  :url="pageMeta.url"
                  :title="pageMeta.title"
                  :description="pageMeta.description"
                >
                  <BaseIcon icon="mdi:envelope" />
                </SocialShare>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section v-if="upsellProducts" class="container mb-12">
      <h2 class="mb-12">{{ $t('products._slug.upSell.title') }}</h2>
      <ProductPreviews
        :products="upsellProducts"
        :slider="true"
        :column-count="upsellProductCols"
      />
    </section>
  </main>
</template>

<script>
// Helpers
import { mapState } from 'vuex';
import { validationMixin } from 'vuelidate';
import { required } from 'vuelidate/lib/validators';
import get from 'lodash/get';

import pageMeta from '~/mixins/pageMeta';
import { listVisibleOptions } from '~/modules/swell/utils/listVisibleOptions';
import { getVariantOptionIds } from '~/modules/swell/utils/getVariantOptionIds';
import refetchCurrencyMixin from '~/modules/swell/mixins/refetchCurrency';
import { getInitialSelection } from '~/utils/purchaseOptions';

export default {
  name: 'ProductDetailPage',
  mixins: [pageMeta, validationMixin, refetchCurrencyMixin],

  data() {
    return {
      product: {},
      quantity: 1,
      enableQuantity: true,
      maxQuantity: 99,
      relatedProducts: [], // TODO
      bundleItemsOptionState: null,
      bundleItemsAvailable: true,
      /**
       * Option state with initial values.
       * @type { { [id: string]: { name: string, value: string, isVisible: boolean } } }
       */
      optionState: {},
      selectedPurchaseOption: undefined,
      productBenefits: [],
      upsellProductCols: 4,
      enableSocialSharing: false,
      showStockLevel: false,
      activeDropdownUID: null,
    };
  },

  async fetch() {
    const { $swell, $route } = this;

    // Fetch product
    const product = await $swell.products.get($route.params.slug, {
      expand: ['up_sells.product', 'cross_sells'],
    });

    const options = product.purchaseOptions;

    if (options && options.subscription && options.subscription.plans) {
      options.subscription.plans = options.subscription.plans.filter(
        (item) => item && item.price >= 0,
      );
    }

    // Show 404 if product isn't found
    if (!product) {
      return this.$nuxt.error({
        statusCode: 404,
        message: this.$t('errors.productNotFound'),
      });
    }

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

    // TODO generate related products
    const relatedProducts = [];
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
    this.getInitialOptions(product);
    this.relatedProducts = relatedProducts;
    this.productBenefits = get(product, 'content.productBenefits', []);
    this.enableSocialSharing = get(product, 'content.enableSocialSharing');
    this.showStockLevel = get(product, 'content.showStockLevel');
    this.enableQuantity = get(product, 'content.enableQuantity');
    this.upsellProductCols = get(product, 'content.upSellCols') || 4;
    this.maxQuantity = maxQuantity;
  },

  computed: {
    ...mapState(['cartIsUpdating', 'headerIsVisible', 'currency']),

    // Resulting combination of selected product options
    variation() {
      if (!this.product) return {};
      return this.$swell.products.variation(
        this.product,
        this.selectedOptions,
        this.selectedPurchaseOption,
      );
    },

    variationCurrency() {
      if (!this.variation) return this.product.currency;

      const id = this.variation.variantId;
      const activeVariant = this.variation.variants?.results.find(
        (variant) => variant.id === id,
      );

      return (
        (activeVariant && activeVariant.currency) || this.variation.currency
      );
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

      if (
        !this.bundleItemsAvailable ||
        this.variation.price < 0 ||
        this.variationCurrency !== this.currency
      )
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

    /**
     * Formatted optionState in a swell-js-compatible structure
     * @type { { [name: string]: string } }
     */
    selectedOptions() {
      return this.normalizeOptions(this.optionState);
    },

    upsellProducts() {
      if (!this.product?.upSells?.length) return null;
      return this.product.upSells.map((upsell) => upsell.product);
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
          component: () =>
            import(`../../components/ProductOption${componentName}.vue`),
        });

        return optionInputs;
      }, []);
    },
  },

  watch: {
    currency: '$fetch',

    // Reset quantity on change of purchase option
    selectedPurchaseOption() {
      this.quantity = 1;
    },

    variation(newVariation) {
      this.exposeProduct(newVariation);
    },
  },

  mounted() {
    // Check bundle item availability on mount
    this.checkBundleItemAvailability();
  },

  methods: {
    // Select attribute component based on type
    getAttributeComponent(type) {
      switch (type) {
        case 'long_text':
        case 'textarea':
          return 'AttributeLongText';
        case 'file':
          return 'AttributeFile';
        case 'image':
          return 'AttributeImage';
        case 'currency':
          return 'AttributeCurrency';
        // TODO: add components for other supported attribute types
        default:
          return 'AttributeShortText';
      }
    },

    // Set which dropdown is active by UID, so that only one dropdown is active at any time.
    setActiveDropdownUID(uid) {
      this.activeDropdownUID = uid;
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
            options: this.selectedOptions,
            purchaseOption: this.selectedPurchaseOption,
          });
        }
      } catch (err) {
        if (err.message === 'invalid_stock') {
          this.$store.dispatch('showNotification', {
            message: this.$t('cart.exceedsStockLevel'),
            type: 'error',
          });
        }
      }
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
        return;
      }
      this.bundleItemsAvailable = true;
    },

    // Go back to previous page
    navigateBack() {
      this.$router.back();
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

      // Mark visible options as such
      this.optionState = this.markVisibleOptions(optionState, visibleOptions);
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

    // Make product data available on the Window object,
    // so that it can be consumed by 3rd party plugins
    exposeProduct(variation) {
      if (!window) return;

      const existingData = window.Swell;

      /**
       * @type {{ version?: string, theme: { page: { product: { id: string, variation: { id: string, stock: { level: number | undefined, purchasable: boolean, status: string | null, tracking: boolean }}}}}}}
       */
      const swellData = {
        ...existingData,
        theme: {
          ...existingData?.theme,
          page: {
            ...existingData?.theme?.page,
            product: {
              id: this.product.id,
              variation: {
                id: this.variation.variantId || this.variation.id,
                stock: {
                  status: this.variation.stockStatus,
                  purchasable: this.variation.stockPurchasable,
                  tracking: this.variation.stockTracking,
                  level: this.variation.stockLevel,
                },
              },
            },
          },
        },
      };

      window.Swell = swellData;

      const event = new CustomEvent('variation-change', { detail: variation });
      window.dispatchEvent(event);
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
