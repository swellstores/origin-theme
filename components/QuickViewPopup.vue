<template>
  <transition name="popup" :duration="700" appear>
    <div v-if="product" class="z-40 fixed inset-0">
      <!-- Overlay -->
      <div
        class="overlay opacity-50 absolute w-full h-full bg-primary-darker"
        @click="$emit('click-close')"
      ></div>

      <!-- Panel -->
      <div
        class="panel w-full md:w-max h-vh-gap md:h-auto md:max-h-80vh absolute md:relative bottom-0 
        rounded-t md:rounded-md bg-primary-lighter md:center-xy overflow-scroll"
      >
        <button
          class="relative md:absolute mt-3 mr-3 float-right md:float-none right-0 md:mr-6 md:mt-6 z-10"
          @click.prevent="$emit('click-close')"
        >
          <BaseIcon icon="uil:multiply" size="sm" />
        </button>

        <div class="container md:overflow-hidden grid grid-cols-1 md:grid-cols-2 pt-3 md:p-6">
          <!-- Product image -->
          <div class="relative h-min mb-5 md:mb-0 md:w-120">
            <MediaSlider :media="product.images" class="md:hidden h-0 pb-full" />
            <!-- Media stack for large screens -->
            <div class="hidden h-full md:block">
              <template v-for="(image, index) in product.images">
                <div v-show="index === productPreviewIndex" :key="image.id">
                  <VisualMedia
                    :id="index"
                    :source="image"
                    :alt="image.alt"
                    sizes="(min-width: 768px) 50vw, 100vw"
                  />
                </div>
              </template>

              <div class="flex no-wrap overflow-scroll mt-6">
                <button
                  class="w-20 h-20 flex-shrink-0 p-2 mr-2 rounded hover:border-primary-med transition duration-300 ease"
                  v-for="(image, index) in product.images"
                  :key="image.id"
                  :class="{
                    'border border-primary-darkest': index === productPreviewIndex,
                    'border border-primary-lighter': index !== productPreviewIndex
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
          </div>

          <!-- Product details -->
          <div class="relative pb-6 md:pb-0 md:ml-5">
            <div class="relative h-full md:overflow-scroll">
              <div class="relative md:absolute w-full">
                <h2 v-balance-text class="mb-4 leading-tight">{{ product.name }}</h2>
                <NuxtLink
                  class="inline-block underline mb-5"
                  :to="resolveUrl({ type: 'product', value: product.slug })"
                  >View full details</NuxtLink
                >

                <!-- Product options -->
                <div v-for="input in optionInputs" :key="input.name" class="mb-8">
                  <component
                    :is="input.component"
                    v-if="visibleOptionIds.includes(input.option.id)"
                    :option="input.option"
                    :current-value="optionState[input.option.name]"
                    @value-changed="setOptionValue"
                  />
                </div>

                <!-- Duplicate button element to match fixed button height -->
                <button
                  :class="{ loading: cartIsUpdating }"
                  type="submit"
                  class="btn btn--lg relative w-full opacity-0 pointer-events-none"
                  @click.prevent="addToCart"
                >
                  |
                </button>
              </div>
            </div>
            <!-- Cart button & stock info -->
            <div v-if="variation" class="w-full-px-12 fixed md:w-full md:absolute bottom-0">
              <!-- Gradient overlay to cover overflow elements -->
              <div class="gradient"></div>

              <button
                :class="{ loading: cartIsUpdating }"
                type="submit"
                class="btn btn--lg relative w-full"
                @click.prevent="addToCart"
              >
                <div v-show="!cartIsUpdating">
                  <span>Add to cart</span>
                  <span class="inline-block w-5 mx-1 mb-1 border-b border-primary-lightest"></span>
                  <span>{{ formatMoney(variation.price, currency) }}</span>
                  <span v-if="billingInterval">{{ billingInterval }}</span>
                  <span v-if="variation.origPrice" class="ml-1 line-through text-primary-med">
                    {{ formatMoney(variation.origPrice, currency) }}
                  </span>
                </div>
                <div v-show="cartIsUpdating" class>
                  <div class="spinner absolute inset-0 mt-3"></div>
                  <span class="absolute inset-0 mt-5">Updating</span>
                </div>
              </button>

              <div class="h-6 bg-primary-lighter md:hidden"></div>
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
import { listVisibleOptions } from '~/modules/swell'
import { mapState } from 'vuex'

export default {
  async fetch() {
    const { $swell } = this

    // Fetch product
    const product = await $swell.products.get(this.productId)

    // Compute initial values for options
    const optionState =
      this.optionState ||
      (product.options || []).reduce((options, { name, values }) => {
        // Set first available value for current option
        options[name] = get(values, '0.name')
        return options
      }, {})

    // Set component data
    this.product = product
    this.optionState = optionState
  },

  props: {
    productId: {
      type: String,
      default: null
    }
  },

  data() {
    return {
      product: null,
      pendingState: false,
      optionState: null,
      productPreviewIndex: 0
    }
  },

  computed: {
    ...mapState(['currency', 'cartIsUpdating']),

    // Resulting combination of selected product options
    variation() {
      if (!this.product) return {}
      return this.$swell.products.variation(this.product, this.optionState)
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
        if (option.subscription && option.values.length < 2) return optionInputs

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

  methods: {
    // Update an option value based on user input
    setOptionValue({ option, value }) {
      // Use $set to update the data object because options are dynamic
      // and optionState won't be reactive otherwise
      // TODO in Vue 3 this.optionState[option] = value should work
      this.$set(this.optionState, option, value)
    },

    // Set product preview
    setProductPreview(index) {
      this.productPreviewIndex = index
    },

    // Add product to cart with selected options
    async addToCart() {
      this.$store.commit('setState', { key: 'addedItem', value: this.variation })
      await this.$store.dispatch('addCartItem', {
        productId: this.variation.id,
        quantity: 1,
        options: this.optionState
      })

      // Close popup when product has been added to cart
      this.$emit('click-close')
    }
  }
}
</script>

<style lang="postcss">
.gradient {
  @apply w-full h-12;
  background: rgb(255, 255, 255);
  background: linear-gradient(
    0deg,
    theme('colors.primary.lighter') 0%,
    theme('colors.primary.lighter') 25%,
    rgba(255, 255, 255, 0) 100%
  );
}
</style>
