<template>
  <div>
    <button
      v-if="!quickAddIsActive && !cartIsUpdating"
      class="btn w-full shadow-md"
      @click="interact"
    >
      {{ label }}
    </button>

    <!-- Quick Add -->
    <transition name="fade" :duration="200">
      <div
        v-if="quickAddIsActive"
        class="w-full bottom-0 px-4 py-3 bg-primary-lighter shadow-md rounded z-10"
      >
        <!-- Product options -->
        <div v-for="(input, index) in optionInputs" :key="input.name">
          <component
            :is="input.component"
            v-if="visibleOptionIds.includes(input.option.id)"
            v-show="index === quickAddIndex"
            :option="input.option"
            @value-changed="setOptionValue"
          />
        </div>
      </div>
    </transition>

    <ButtonLoading
      v-if="cartIsUpdating"
      class="absolute left-0 bottom-0 w-full dark"
      label="Adding..."
      loadingLabel="Adding..."
    />
  </div>
</template>

<script>
// Helpers
import get from 'lodash/get'
import { mapState } from 'vuex'
import { listVisibleOptions } from '~/modules/swell'

export default {
  props: {
    product: {
      type: Object,
      default: () => {}
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

  data() {
    return {
      label: null,
      flow: null,
      optionState: null,
      quickAddIsActive: false,
      quickAddIndex: 0
    }
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
            componentName = 'ProductOptionText'
            break
          case 'long_text':
            componentName = 'ProductOptionText'
            break
          case 'toggle':
            componentName = 'ProductOptionCheckbox'
            break
          default:
            componentName = 'ProductOptionSelect'
        }

        // Don't include subscription plan if there's only one option value available
        if (option.subscription && option.values.length < 2) {
          return optionInputs
        }

        optionInputs.push({
          option,
          component: () => import(`~/components/${componentName}`)
        })

        return optionInputs
      }, [])
    },

    visibleOptionIds() {
      const options = get(this, 'product.options', [])
      const optionState = this.optionState

      return listVisibleOptions(options, optionState).map(({ id }) => id)
    }
  },

  created() {
    this.setFlow()
  },

  methods: {
    // Sets flow of product purchase + labels
    setFlow() {
      const { optionInputs } = this

      if (optionInputs.length > 2) {
        this.label = 'Quick view'
        this.flow = 'quick-view'
      } else if (optionInputs.length > 0 && optionInputs.length < 3) {
        this.label = 'Quick add'
        this.flow = 'quick-add'
      } else {
        this.label = 'Add to cart'
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

      // Add to cart if only one option was available
      if (optionInputs.length === 1 || quickAddIndex + 1 >= optionInputs.length) {
        this.addToCart()

        // Hide options when adding to cart
        this.quickAddIsActive = false
      } else {
        // Move onto next option if available
        this.quickAddIndex++
      }
    },

    // Handle flow on click event
    interact() {
      switch (this.flow) {
        case 'quick-view':
          this.$emit('open-quick-view')
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

    // Add product to cart with selected options
    addToCart() {
      // Emit event to show updating label
      this.$emit('adding-to-cart')

      // Emit event to hide quick add button if keep-alive is active
      this.$emit('keep-alive', false)

      this.$store.dispatch('addCartItem', {
        productId: this.variation.id,
        quantity: 1,
        options: this.optionState
      })
    }
  }
}
</script>
