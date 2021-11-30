<template>
  <div>
    <BaseButton
      v-show="!quickAddIsActive && !cartIsUpdating"
      :label="label"
      @click.native="interact"
    />

    <!-- Quick Add -->
    <transition name="fade" :duration="200">
      <div
        v-if="quickAddIsActive"
        class="
          w-full
          bottom-0
          px-4
          py-3
          bg-primary-lighter
          shadow-md
          rounded
          z-10
        "
      >
        <!-- Product options -->
        <div v-for="(input, index) in optionInputs" :key="input.name">
          <component
            :is="input.component"
            v-if="visibleOptionIds.includes(input.option.id)"
            v-show="index === quickAddIndex"
            :option="input.option"
            :current-value="optionState[input.option.name]"
            :validation="$v.optionState[input.option.name]"
            @value-changed="setOptionValue"
            @dropdown-active="setActiveDropdownUID($event)"
          />
        </div>
      </div>
    </transition>

    <!-- Error messages -->
    <div v-if="addToCartError" class="relative px-4">
      <div
        class="
          absolute
          left-0
          bottom-0
          w-full
          px-4
          py-3
          bg-primary-lighter
          rounded
        "
      >
        <span class="w-full label-sm text-error text-center">{{
          $t('products.preview.quickAdd.outOfStock')
        }}</span>
      </div>
    </div>

    <!-- Adding in progress -->
    <div v-if="cartIsUpdating" class="relative px-4">
      <BaseButton
        class="absolute left-0 bottom-0 w-full"
        :label="$t('products.preview.quickAdd.adding.label')"
        :loading-label="$t('products.preview.quickAdd.adding.loadingLabel')"
      />
    </div>
  </div>
</template>

<script>
// Helpers
import get from 'lodash/get'
import { mapState } from 'vuex'
import { validationMixin } from 'vuelidate'
import { required } from 'vuelidate/lib/validators'
import { listVisibleOptions } from '~/modules/swell'

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
      optionState: null,
      quickAddIsActive: false,
      quickAddIndex: 0,
      addToCartError: null,
    }
  },

  fetch() {
    // Compute initial values for options
    const optionState =
      this.optionState ||
      (this.product.options || []).reduce((options, { name, values }) => {
        // Set first available value for current option
        options[name] = get(values, '0.name')
        return options
      }, {})

    // Set component data
    this.optionState = optionState
  },

  computed: {
    ...mapState(['cartIsUpdating']),

    options() {
      if (!this.product) return
      return this.product.options
    },

    // Resulting combination of selected product options
    variation() {
      if (!this.product) return {}
      return this.$swell.products.variation(this.product, this.optionState)
    },

    optionInputs() {
      if (!this.product) return {}
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
  },

  created() {
    this.setFlow()
  },

  methods: {
    // Sets flow of product purchase + labels
    setFlow() {
      const { optionInputs, product } = this

      if (
        product.bundleItems?.length ||
        optionInputs.length > 2 ||
        optionInputs.some(({ option }) =>
          option.inputType ? !option.inputType.includes('select') : false
        )
      ) {
        this.label = this.$t('products.preview.quickAdd.quickView')
        this.flow = 'quick-view'
      } else if (optionInputs.length > 0 && optionInputs.length < 3) {
        this.label = this.$t('products.preview.quickAdd.quickAdd')
        this.flow = 'quick-add'
      } else {
        this.label = this.$t('products.preview.quickAdd.addToCart')
        this.flow = 'add-to-cart'
      }
    },

    // Update an option value based on user input
    setOptionValue({ option, value }) {
      const { optionState, optionInputs, quickAddIndex } = this
      // Use $set to update the data object because options are dynamic
      // and optionState won't be reactive otherwise
      // TODO in Vue 3 this.optionState[option] = value should work
      this.$set(optionState, option, value)
      this.$emit('keep-alive', true)

      // Validate current field
      this.$v.optionState[option].$touch()
      if (this.$v.optionState[option].$invalid) return

      // Add to cart if only one option was available
      if (
        optionInputs.length === 1 ||
        quickAddIndex + 1 >= optionInputs.length
      ) {
        // Hide options when adding to cart
        this.quickAddIsActive = false

        // Check if product/variant is in stock before adding to cart
        if (!this.checkHasStock()) {
          this.addToCartError = 'Out of stock'
          return
        }

        // Add to cart
        this.addToCart()
      } else {
        // Move onto next option if available
        this.quickAddIndex++
      }
    },

    // Handle flow on click event
    interact() {
      switch (this.flow) {
        case 'quick-view':
          this.$store.commit('setState', {
            key: 'quickViewIsVisible',
            value: true,
          })
          this.$store.commit('setState', {
            key: 'quickViewProductId',
            value: this.product.id,
          })
          break
        case 'quick-add':
          this.quickAddIsActive = true
          break
        case 'add-to-cart':
          this.addToCart()
          break
        default:
          this.addToCart()
      }
    },

    // Check if current variation has stock
    checkHasStock() {
      const { product, variation } = this
      return (
        !product.stockTracking ||
        product.stockPurchasable ||
        ((variation.stockStatus !== 'out_of_stock' || variation.stockStatus) &&
          variation.stockLevel > 0)
      )
    },

    // Add product to cart with selected options
    async addToCart() {
      try {
        await this.$store.dispatch('addCartItem', {
          productId: this.variation.id,
          quantity: 1,
          options: this.optionState,
        })

        // Close popup when product has been added to cart
        this.$emit('click-close')
      } catch (err) {
        let errorMessage
        switch (err.message) {
          case 'invalid_stock':
            errorMessage = this.$t('cart.exceedsStockLevel')
            break
          default:
            break
        }

        this.$store.dispatch('showNotification', {
          message: errorMessage,
          type: 'error',
        })
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
