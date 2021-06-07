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
        <div
          v-for="(input, index) in optionInputs"
          :key="input.name"
          :set="(v = $v.optionState[input.option.name]) || null"
        >
          <component
            :is="input.component"
            v-show="index === quickAddIndex"
            v-if="visibleOptionIds.includes(input.option.id)"
            :option="input.option"
            :current-value="optionState[input.option.name]"
            :emit-on-enter="input.option.inputType.includes('text')"
            :show-value-description="false"
            @value-changed="setOptionValue"
          />

          <template v-if="v">
            <div v-if="v.$dirty && v.$error" class="text-error mt-2">
              <span v-if="!v.required" class="label-sm text-error">{{
                $t('products.slug.options.required')
              }}</span>
            </div>
          </template>
        </div>
      </div>
    </transition>

    <!-- Adding in progress -->
    <div v-if="cartIsUpdating" class="relative px-4">
      <ButtonLoading
        class="absolute left-0 bottom-0 w-full dark px-4 py-3"
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
      optionState: fields
    }
  }
}
</script>
