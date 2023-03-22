<template>
  <div class="flex py-4">
    <div class="mr-6 w-40">
      <VisualMedia
        v-if="item.product.images && item.product.images.length"
        :source="item.product.images[0]"
        sizes="(min-width: 768px) 50vw, 100vw"
      />

      <!-- Fallback image -->
      <div v-else class="relative rounded bg-primary-lighter pb-full">
        <BaseIcon
          icon="uil:camera-slash"
          size="lg"
          class="center-xy absolute text-primary-med"
        />
      </div>
    </div>

    <div class="w-full">
      <NuxtLink
        class="pb-4"
        :to="
          localePath(
            resolveUrl({
              type: 'product',
              value: item.product.slug,
            }),
          )
        "
      >
        {{ item.product.name }} × {{ item.quantity }}
      </NuxtLink>

      <template v-if="customizable">
        <div v-for="input in optionInputs" :key="input.name" class="mt-4">
          <component
            :is="input.component"
            v-if="visibleOptionIds.includes(input.option.id)"
            :option="input.option"
            appearance="menu"
            :current-value="getCurrentOptionValue(input.option.name)"
            :validation="
              $v.itemValidationState
                ? $v.itemValidationState[input.option.name]
                : null
            "
            @value-changed="setOptionValue"
          />
        </div>
      </template>

      <template v-else>
        <p v-for="option in item.options" :key="option.id">
          <span>{{ option.name }}: {{ option.value }}</span>
        </p>
      </template>

      <span
        v-if="variation && !available"
        class="label-sm mt-4 block text-error-default"
      >
        {{ $t('products._slug.bundle.outOfStock') }}
      </span>
    </div>
  </div>
</template>

<script>
// Helpers
import get from 'lodash/get';
import { validationMixin } from 'vuelidate';
import { required } from 'vuelidate/lib/validators';
import { listVisibleOptions } from '~/modules/swell/utils/listVisibleOptions';

export default {
  name: 'ProductBundleItem',

  mixins: [validationMixin],

  props: {
    item: {
      type: Object,
      default: () => {},
    },
    optionState: {
      type: [Object, Array],
      default: () => [],
    },
  },

  data() {
    return {
      product: null,
    };
  },

  async fetch() {
    const { $swell, item } = this;

    // Fetch product
    if (!item) return;
    const product = await $swell.products.get(item.productId);

    // Set component data
    this.product = product;

    // Emit event to check availability of all bundled items
    this.$emit('check-availability');
  },

  computed: {
    // Resulting combination of selected product options
    variation() {
      const { $swell, itemOptionState, product } = this;
      if (!product || !itemOptionState?.options) return null;
      const options = itemOptionState.options.reduce(
        (options, { name, value }) => {
          options[name] = value;
          return options;
        },
        {},
      );

      return $swell.products.variation(product, options);
    },

    available() {
      if (!this.variation) return null;
      const { stockStatus, stockTracking, stockPurchasable } = this.variation;

      return (
        (stockStatus && stockStatus !== 'out_of_stock') ||
        !stockTracking ||
        stockPurchasable
      );
    },

    customizable() {
      return this.item.variable === 'choose';
    },

    visibleOptionIds() {
      const options = get(this.item, 'product.options', []);
      const optionState = this.optionState;

      return listVisibleOptions(options, optionState).map(({ id }) => id);
    },

    itemOptionState() {
      return this.optionState.find(
        (option) => option.productId === this.item.productId,
      );
    },

    itemValidationState() {
      return this.itemOptionState.options.reduce((obj, option) => {
        obj[option.name] = option.value;
        return obj;
      }, {});
    },

    optionInputs() {
      const options = get(this.item, 'product.options', []);

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

        optionInputs.push({
          option,
          component: () => import(`./ProductOption${componentName}.vue`),
        });

        return optionInputs;
      }, []);
    },
  },

  methods: {
    setOptionValue({ option, value }) {
      this.$emit('value-changed', {
        option,
        value,
        productId: this.item.productId,
      });

      // Emit event to check availability of all bundled items
      this.$emit('check-availability');
    },

    getCurrentOptionValue(optionName) {
      const option = this.itemOptionState.options.find(
        (option) => option.name === optionName,
      );
      return option.value;
    },
  },

  validations() {
    const { item } = this;
    // Product options
    if (!this.customizable) return {};
    const options = get(item, 'product.options', []);
    const fields = options.reduce((obj, option) => {
      if (option.required) {
        obj[option.name] = { required };
      }
      return obj;
    }, {});

    return {
      itemValidationState: {
        ...fields,
      },
    };
  },
};
</script>
