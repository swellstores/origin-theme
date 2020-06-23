<template>
  <div v-if="$fetchState.error">
    Error page TODO
  </div>
  <main v-else>
    <!-- Core product content -->
    <section class="pb-12 md:flex">
      <div class="relative md:w-1/2">
        <!-- Media slider for small screens -->
        <MediaSlider :media="product.images" class="md:hidden h-0 pb-full" />
        <!-- Media stack for large screens -->
        <div class="hidden h-full md:block">
          <div v-if="$fetchState.pending" class="h-full bg-primary-lighter"></div>
          <template v-else>
            <VisualMedia
              v-for="image in product.images"
              :key="image.id"
              :source="image"
              :alt="image.alt"
              sizes="(min-width: 768px) 50vw, 100vw"
            />
          </template>
        </div>

        <!-- Back button -->
        <a
          href="#"
          class="fixed left-6 bottom-6 rounded-full shadow-md w-9 h-9 bg-primary-lighter flex items-center justify-center"
          @click.prevent="navigateBack"
        >
          <BaseIcon icon="uil:angle-left" class="-ml-px" />
        </a>
      </div>

      <!-- Product overview -->
      <div class="md:w-1/2 lg:px-6 xl:px-12">
        <div class="container top-20 pt-10 md:sticky md:pt-12">
          <!-- Skeleton loader -->
          <div v-if="$fetchState.pending">
            <div class="loader-el w-32 h-3 mb-4"></div>
            <div class="loader-el w-2/3 h-9 mb-7"></div>
            <div class="loader-el w-40 h-3 mb-4"></div>
            <div class="loader-el w-20 h-4 mb-12"></div>
            <div
              v-for="item in [1, 2, 3, 4, 5, 6, 7]"
              :style="`width: ${100 - Math.random() * 20}%`"
              class="loader-el h-2 mb-4"
            ></div>
            <div class="flex justify-between mt-12 mb-4">
              <div class="loader-el w-24 h-3"></div>
              <div class="loader-el w-48 h-3"></div>
            </div>
            <div class="loader-el h-12 mb-10"></div>
            <div v-for="item in [1, 2, 3]" class="flex items-center mb-2">
              <div class="loader-el w-5 h-5 mr-2 rounded-full"></div>
              <div :style="`width: ${80 - Math.random() * 30}%`" class="loader-el h-2"></div>
            </div>
          </div>

          <!-- Main content -->
          <div v-else>
            <div class="label-xs-bold mb-2 text-primary-dark">Breadcrumb TODO</div>
            <h1 v-balance-text class="mb-4 leading-tight">{{ product.name }}</h1>
            <ReviewStars :score="4.5" size="sm" /><span class="text-sm">384 Reviews TODO</span>
            <div class="font-semibold text-lg flex items-center mt-2 mb-5 md:mb-8">
              <span>{{ formatMoney(variation.price, variation.currency) }}</span>
              <span
                v-if="variation.origPrice"
                class="inline-block ml-3 rounded bg-error-faded -mt-2px px-2 h-6 leading-loose text-error uppercase text-xs"
                >Save
                {{ formatMoney(variation.origPrice - variation.price, variation.currency) }}</span
              >
            </div>
            <div v-html="product.description" />

            <!-- Product options -->
            <div v-for="input in optionInputs" :key="input.name" class="my-8">
              <component
                :is="input.component"
                :option="input.option"
                :current-value="currentOptions[input.option.name]"
                @value-changed="setOptionValue"
              />
            </div>

            <!-- Cart button & stock info -->
            <div v-if="variation" class="relative my-8">
              <StockStatus :status-value="variation.stockStatus" />
              <button
                :class="{ loading: cartIsUpdating }"
                type="submit"
                class="btn btn--lg relative w-full"
                @click.prevent="addToCart"
              >
                <div v-show="!cartIsUpdating">
                  <span>Add to cart</span>
                  <span class="inline-block w-5 mx-1 mb-1 border-b border-primary-lightest"></span>
                  <span>{{ formatMoney(variation.price, variation.currency) }}</span>
                  <span v-if="variation.origPrice" class="line-through text-primary-dark">
                    {{
                      formatMoney(variation.origPrice - variation.price, variation.currency)
                    }}</span
                  >
                </div>
                <div v-show="cartIsUpdating" class>
                  <div class="spinner absolute inset-0 mt-3"></div>
                  <span class="absolute inset-0 mt-5">Updating</span>
                </div>
              </button>
            </div>
            <!-- END Purchase form -->

            <!-- Store features -->
            <div class="my-8">
              <ul class>
                <li v-for="feature in storeFeatures" :key="feature.id" class="label-sm my-2 flex">
                  <BaseIcon :icon="feature.icon" size="sm" class="mr-2 -mb-1" />
                  <span>{{ feature.description }}</span>
                </li>
              </ul>
            </div>

            <!-- Details & attributes -->
            <div class="">
              <div v-for="attribute in attributes" :key="attribute.id">
                <AccordionItem
                  v-if="attribute.type === 'long_text'"
                  :heading="attribute.name"
                  class="mt-6"
                >
                  <div class="pb-3" v-html="attribute.value" />
                </AccordionItem>
                <div v-else class="py-3 flex flex-no-wrap border-b">
                  <strong class="w-1/3 text-primary-darkest pr-6">{{ attribute.name }}</strong>
                  <span class="w-2/3">{{ attribute.value }}</span>
                </div>
              </div>
              <AccordionItem heading="Shipping & returns" />
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<script>
// Helpers
import { mapState } from 'vuex'
import get from 'lodash/get'
import pageMeta from '~/mixins/pageMeta'

export default {
  name: 'ProductDetailPage',
  mixins: [pageMeta],

  data() {
    return {
      product: {},
      relatedProducts: [], // TODO
      currentOptions: {},
      storeFeatures: [],
      attributes: [
        // TODO hook up to product.attributes
        {
          id: 'origin',
          type: 'short_text',
          name: 'Origin',
          value: 'Huila, Colombia'
        },
        {
          id: 'altitude',
          type: 'short_text',
          name: 'Altitude (ft)',
          value: 3440
        },
        {
          id: 'producer',
          type: 'short_text',
          name: 'Producer',
          value: 'Ricardo Alpina'
        },
        {
          id: 'notes',
          type: 'short_text',
          name: 'Notes',
          value: 'Plum, Red Wine, Honeydew'
        },
        {
          id: 'brewing_guide',
          type: 'long_text',
          name: 'Brewing guide',
          value:
            '<ol><li>Heat fresh water to 205°F (96°C)</li><li>Grind coffee</li><li>Pour water over coffee</li><li>Enjoy.</li></ol>'
        }
      ]
    }
  },

  computed: {
    ...mapState(['cartIsUpdating']),

    // Resulting combination of selected product options
    variation() {
      // TODO Fix price calculation error (not showing correct price of options)
      if (!this.product) return {}
      return this.$swell.products.variation(this.product, this.currentOptions)
    },

    optionInputs() {
      const options = get(this, 'product.options', [])
      return options.map(option => {
        let componentName

        switch (option.inputType) {
          case 'select':
            componentName = 'OptionInputSelect'
            break
          case 'toggle':
            componentName = 'OptionInputCheckbox'
            break
          default:
            componentName = 'OptionInputText'
        }

        return {
          option,
          type: option.inputType,
          component: () => import(`~/components/${componentName}`)
        }
      })
    }
  },

  async fetch() {
    const { $swell, $route } = this

    // Fetch product
    const product = await $swell.products.get($route.params.slug)
    // TODO ensure product attributes are present
    // Show 404 if product isn't found
    if (product === null) {
      if (process.server) {
        this.$nuxt.context.res.statusCode = 404
      }
      throw new Error('Product not found')
    }

    // Compute initial values for options
    const currentOptions = product.options.reduce((options, { name, values }) => {
      // Set first available value for current option
      options[name] = get(values, '0.name')
      return options
    }, {})

    // TODO generate related products
    const relatedProducts = []

    // Set component data
    this.product = product
    this.storeFeatures = get(product, 'content.productBenefits', [
      // TODO: remove these defaults
      {
        description: 'Free US shipping on all orders over $100 (international over $200)',
        icon: 'uil:truck'
      },
      {
        description: 'Free returns up to 30 days',
        icon: 'uil:history-alt'
      },
      {
        description: '97% customer satisfaction rating',
        icon: 'uil:award'
      }
    ])
    this.currentOptions = currentOptions
    this.relatedProducts = relatedProducts
  },

  methods: {
    // Add product to cart with selected options
    addToCart() {
      this.$store.dispatch('addCartItem', {
        productId: this.variation.id,
        quantity: 1,
        options: this.currentOptions
      })
    },

    // Update an option value based on user input
    setOptionValue({ option, value }) {
      // Use $set to update the data object because options are dynamic
      // and currentOptions won't be reactive otherwise
      // TODO in Vue 3 this.currentOptions[option] = value should work
      this.$set(this.currentOptions, option, value)
    },

    // Go back to previous page
    navigateBack() {
      this.$router.back()
    }
  }
}
</script>

<style>
.feature-icon {
  width: 1.3rem;
  height: 1.3rem;
}
</style>
