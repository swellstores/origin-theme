<template>
  <main>
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
        <div
          class="container top-0 pt-10 max-w-160 md:sticky md:pt-12 transition-all duration-300 ease-in-out"
          :class="headerIsVisible ? 'top-20' : 'top-0'"
        >
          <!-- Skeleton loader -->
          <div v-if="$fetchState.pending">
            <div class="loader-el w-32 h-3 mb-4"></div>
            <div class="loader-el w-2/3 h-9 mb-7"></div>
            <div class="loader-el w-40 h-3 mb-4"></div>
            <div class="loader-el w-20 h-4 mb-12"></div>
            <div
              v-for="index in 7"
              :key="`skeleton-1-${index}`"
              :style="`width: ${100 - Math.random() * 20}%`"
              class="loader-el h-2 mb-4"
            ></div>
            <div class="flex justify-between mt-12 mb-4">
              <div class="loader-el w-24 h-3"></div>
              <div class="loader-el w-48 h-3"></div>
            </div>
            <div class="loader-el h-12 mb-10"></div>
            <div v-for="index in 3" :key="`skeleton-2-${index}`" class="flex items-center mb-2">
              <div class="loader-el w-5 h-5 mr-2 rounded-full"></div>
              <div :style="`width: ${80 - Math.random() * 30}%`" class="loader-el h-2"></div>
            </div>
          </div>

          <!-- Main content -->
          <div v-else>
            <!--TODO<div class="label-xs-bold mb-2 text-primary-dark">{{ breadcrumb }}</div>-->
            <h1 v-balance-text class="mb-4 leading-tight">{{ product.name }}</h1>
            <!--TODO awaiting customer reviews feature
            <ReviewStars :score="reviews.averageScore" size="sm" />
            <span class="text-sm">{{ reviews.total }} reviews</span>
            -->
            <div class="font-semibold text-lg flex items-center mt-2 mb-5 md:mb-8">
              <span>{{ formatMoney(variation.price, currency) }}</span>
              <span v-if="billingInterval" class="lowercase">&nbsp;{{ billingInterval }}</span>
              <span
                v-if="variation.origPrice"
                class="inline-block ml-3 rounded bg-error-faded -mt-2px px-2 h-6 leading-loose text-error uppercase text-xs"
              >
                {{ $t('products.slug.save') }}
                {{ formatMoney(variation.origPrice - variation.price, currency) }}
              </span>
            </div>
            <div v-html="product.description" />

            <!-- Product options -->
            <div v-for="input in optionInputs" :key="input.name" class="my-8">
              <component
                :is="input.component"
                v-if="visibleOptionIds.includes(input.option.id)"
                :option="input.option"
                :current-value="optionState[input.option.name]"
                :active-dropdown-u-i-d="activeDropdownUID"
                @value-changed="setOptionValue"
                @dropdown-active="setActiveDropdownUID($event)"
              />
            </div>

            <!-- Cart button & stock info -->
            <div v-if="variation" class="relative my-8">
              <StockStatus
                v-if="product.stockTracking && !product.stockPurchasable"
                :status-value="variation.stockStatus"
              />
              <button
                :class="{
                  loading: cartIsUpdating,
                  disabled: disableOnVariantStockStatus(variation.stockStatus)
                }"
                type="submit"
                class="btn btn--lg relative w-full"
                :disabled="disableOnVariantStockStatus(variation.stockStatus)"
                @click.prevent="addToCart"
              >
                <div v-show="!cartIsUpdating">
                  <span>{{ $t('products.slug.addToCart') }}</span>
                  <span class="inline-block w-5 mx-1 mb-1 border-b border-primary-lightest"></span>
                  <span>{{ formatMoney(variation.price, currency) }}</span>
                  <span v-if="billingInterval">{{ billingInterval }}</span>
                  <span v-if="variation.origPrice" class="ml-1 line-through text-primary-med">
                    {{ formatMoney(variation.origPrice, currency) }}
                  </span>
                </div>
                <div v-show="cartIsUpdating" class>
                  <div class="spinner absolute inset-0 mt-3"></div>
                  <span class="absolute inset-0 mt-5">{{ $t('products.slug.updating') }}</span>
                </div>
              </button>
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
                <component :is="getAttributeComponent(attribute.type)" :attribute="attribute" />
              </template>
            </div>

            <!-- Share product -->
            <div v-if="enableSocialSharing" class="py-3 flex flex-no-wrap">
              <strong class="w-1/4 text-primary-darkest pr-6">{{
                $t('products.slug.share')
              }}</strong>
              <div class="w-3/4 flex justify-end">
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
  </main>
</template>

<script>
// Helpers
import { mapState } from 'vuex'
import get from 'lodash/get'
import pageMeta from '~/mixins/pageMeta'
import { listVisibleOptions } from '~/modules/swell'

export default {
  name: 'ProductDetailPage',
  mixins: [pageMeta],

  async fetch() {
    const { $swell, $route } = this

    // Fetch product
    const product = await $swell.products.get($route.params.slug)

    // Show 404 if product isn't found
    if (!product) {
      return this.$nuxt.error({ statusCode: 404, message: this.$t('errors.productNotFound') })
    }

    // Compute initial values for options
    const optionState =
      this.optionState ||
      (product.options || []).reduce((options, { name, values, inputType }) => {
        // Set first available value for select current option
        if (inputType === 'select') options[name] = get(values, '0.name')
        return options
      }, {})

    // TODO generate related products
    const relatedProducts = []

    // Set component data
    this.product = product
    this.optionState = optionState
    this.relatedProducts = relatedProducts
    this.productBenefits = get(product, 'content.productBenefits', [])
    this.enableSocialSharing = get(product, 'content.enableSocialSharing')
  },

  data() {
    return {
      product: {},
      relatedProducts: [], // TODO
      optionState: null,
      productBenefits: [],
      enableSocialSharing: false,
      activeDropdownUID: null
    }
  },

  computed: {
    ...mapState(['cartIsUpdating', 'headerIsVisible', 'currency']),

    // Resulting combination of selected product options
    variation() {
      if (!this.product) return {}
      return this.$swell.products.variation(this.product, this.optionState)
    },

    billingInterval() {
      return get(this, 'optionState.Plan')
    },

    visibleOptionIds() {
      const options = get(this, 'product.options', [])
      const optionState = this.optionState

      return listVisibleOptions(options, optionState).map(({ id }) => id)
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
    }
  },

  methods: {
    // Select attribute component based on type
    getAttributeComponent(type) {
      switch (type) {
        case 'long_text':
        case 'textarea':
          return 'AttributeLongText'
        case 'file':
          return 'AttributeFile'
        // TODO: add components for other supported attribute types
        default:
          return 'AttributeShortText'
      }
    },

    // Set which dropdown is active by UID, so that only one dropdown is active at any time.
    setActiveDropdownUID(uid) {
      this.activeDropdownUID = uid
    },

    // Determine whether to disable Add to Cart button based on the variant's stock status
    disableOnVariantStockStatus(stockStatus) {
      return (
        (stockStatus === 'out_of_stock' || !stockStatus) &&
        this.product.stockTracking &&
        !this.product.stockPurchasable
      )
    },

    // Add product to cart with selected options
    addToCart() {
      this.$store.dispatch('addCartItem', {
        productId: this.variation.id,
        quantity: 1,
        options: this.optionState
      })
    },

    // Update an option value based on user input
    setOptionValue({ option, value }) {
      // Use $set to update the data object because options are dynamic
      // and optionState won't be reactive otherwise
      // TODO in Vue 3 this.optionState[option] = value should work
      this.$set(this.optionState, option, value)
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
