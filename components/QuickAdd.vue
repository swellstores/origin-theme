<template>
  <div>
    <BaseButton
      v-show="!quickAddIsActive && !cartIsUpdating && !isSubscription"
      :label="label"
      class="quick-add-button"
      :disabled="!isPurchaseable"
      @click.native="interact"
    />

    <!-- Quick Add -->
    <transition name="fade" :duration="200">
      <div
        v-if="quickAddIsActive"
        class="bottom-0 z-10 w-full rounded bg-primary-lighter px-4 py-3 shadow-md"
      >
        <!-- Product options -->
        <div v-for="(input, index) in optionInputs" :key="input.name">
          <component
            :is="input.component"
            v-if="
              optionState[input.option.id] &&
              optionState[input.option.id].isVisible
            "
            v-show="index === quickAddIndex"
            :option="input.option"
            :current-value="optionState[input.option.id].value"
            :validation="$v.selectedOptions[input.option.name]"
            @value-changed="
              (args) => setOptionValue({ ...args, optionId: input.option.id })
            "
            @dropdown-active="setActiveDropdownUID($event)"
          />
        </div>
      </div>
    </transition>

    <!-- Error messages -->
    <div v-if="addToCartError" class="relative px-4">
      <div
        class="absolute bottom-0 left-0 w-full rounded bg-primary-lighter px-4 py-3"
      >
        <span class="label-sm text-error w-full text-center">{{
          $t('products.preview.quickAdd.outOfStock')
        }}</span>
      </div>
    </div>

    <!-- Adding in progress -->
    <div v-if="cartIsUpdating" class="relative px-4">
      <BaseButton
        class="absolute bottom-0 left-0 w-full"
        :label="$t('products.preview.quickAdd.adding.label')"
        :loading-label="$t('products.preview.quickAdd.adding.loadingLabel')"
      />
    </div>
  </div>
</template>

<script>
// Helpers
import { mapState } from 'vuex';
import { validationMixin } from 'vuelidate';
import { required } from 'vuelidate/lib/validators';
import get from 'lodash/get';

import { listVisibleOptions } from '~/modules/swell/utils/listVisibleOptions';
import { getVariantOptionIds } from '~/modules/swell/utils/getVariantOptionIds';
import { getInitialSelection } from '~/utils/purchaseOptions';

export default {
  mixins: [validationMixin],

  props: {
    product: {
      type: Object,
      default: () => {},
    },
  },

  data() {
    return {
      label: null,
      flow: null,

      /**
       * Option state with initial values.
       * @type { { [id: string]: { name: string, value: string, isVisible: boolean } } }
       */
      optionState: {},
      quickAddIsActive: false,
      quickAddIndex: 0,
      addToCartError: null,
      purchaseOption: getInitialSelection(this.product.purchaseOptions),
      isSubscription: !!(
        this.product?.purchaseOptions?.subscription?.plans?.length ||
        this.product?.options?.some((option) => option.subscription)
      ),
    };
  },

  computed: {
    ...mapState(['cartIsUpdating']),

    options() {
      if (!this.product) return;
      return this.product.options;
    },

    // Resulting combination of selected product options
    variation() {
      if (!this.product) return {};
      return this.$swell.products.variation(this.product, this.selectedOptions);
    },

    activeVariantOptionIds() {
      return getVariantOptionIds(this.product?.variants?.results);
    },

    optionInputs() {
      if (!this.product) return {};
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

    isPurchaseable() {
      const { stockStatus, stockTracking, stockPurchasable } = this.variation;

      return (
        !stockTracking ||
        stockPurchasable ||
        (stockStatus && stockStatus !== 'out_of_stock')
      );
    },
  },

  created() {
    this.setFlow();
  },

  mounted() {
    const productOptions = this.product.options || [];

    /**
     * Option state with initial values for selects.
     * @type { { [id: string]: { name: string, value: string, isVisible: boolean } } }
     */
    const optionState = productOptions.reduce(
      (optionsAcc, { id, name, required, values, inputType }) => {
        const option = { name, required, isVisible: false };
        if (!inputType || inputType === 'select') {
          // Use first available value as the default value for selects
          optionsAcc[id] = { ...option, value: values[0]?.name };
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

  methods: {
    // Sets flow of product purchase + labels
    setFlow() {
      const { optionInputs, product } = this;

      if (
        product.bundleItems?.length ||
        optionInputs.length > 2 ||
        optionInputs.some(({ option }) =>
          option.inputType ? !option.inputType.includes('select') : false,
        )
      ) {
        this.label = this.$t('products.preview.quickAdd.quickView');
        this.flow = 'quick-view';
      } else if (!this.isPurchaseable) {
        this.label = this.$t('products._slug.stockStatus.outOfStock.label');
        this.flow = 'out-of-stock';
      } else if (optionInputs.length > 0 && optionInputs.length < 3) {
        this.label = this.$t('products.preview.quickAdd.quickAdd');
        this.flow = 'quick-add';
      } else {
        this.label = this.$t('products.preview.quickAdd.addToCart');
        this.flow = 'add-to-cart';
      }
    },

    // Update an option value based on user input
    setOptionValue({ optionId, option: name, value }) {
      const { optionInputs, quickAddIndex } = this;

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
      this.$emit('keep-alive', true);

      // Validate current field
      this.$v.selectedOptions[name].$touch();
      if (this.$v.selectedOptions[name].$invalid) return;

      // Add to cart if only one option was available
      if (
        optionInputs.length === 1 ||
        quickAddIndex + 1 >= optionInputs.length
      ) {
        // Hide options when adding to cart
        this.quickAddIsActive = false;

        // Check if product/variant is in stock before adding to cart
        if (!this.checkHasStock()) {
          this.addToCartError = 'Out of stock';
          return;
        }

        // Add to cart
        this.addToCart();
      } else {
        // Move onto next option if available
        this.quickAddIndex++;
      }
    },

    // Handle flow on click event
    interact() {
      switch (this.flow) {
        case 'quick-view':
          this.$store.commit('setState', {
            key: 'quickViewIsVisible',
            value: true,
          });
          this.$store.commit('setState', {
            key: 'quickViewProductId',
            value: this.product.id,
          });
          break;
        case 'out-of-stock':
          break;
        case 'quick-add':
          this.quickAddIsActive = true;
          break;
        case 'add-to-cart':
          this.addToCart();
          break;
        default:
          this.addToCart();
      }
    },

    // Check if current variation has stock
    checkHasStock() {
      const { product, variation } = this;
      return (
        !product.stockTracking ||
        product.stockPurchasable ||
        ((variation.stockStatus !== 'out_of_stock' || variation.stockStatus) &&
          variation.stockLevel > 0)
      );
    },

    // Add product to cart with selected options
    async addToCart() {
      try {
        await this.$store.dispatch('addCartItem', {
          productId: this.variation.id,
          purchaseOption: this.purchaseOption,
          quantity: 1,
          options: this.selectedOptions,
        });

        // Close popup when product has been added to cart
        this.$emit('click-close');
      } catch (err) {
        let errorMessage;
        switch (err.message) {
          case 'invalid_stock':
            errorMessage = this.$t('cart.exceedsStockLevel');
            break;
          default:
            break;
        }

        this.$store.dispatch('showNotification', {
          message: errorMessage,
          type: 'error',
        });
      }
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
.quick-add-button .btn.disabled {
  @apply bg-primary-light text-primary-darkest;
}
</style>
