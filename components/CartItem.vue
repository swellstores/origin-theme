<template>
  <div class="container overflow-hidden">
    <div
      :class="{ 'border-t border-primary-med': index !== 0 }"
      class="flex py-6"
    >
      <NuxtLink
        :to="
          localePath(resolveUrl({ type: 'product', value: item.product.slug }))
        "
        class="flex-shrink-0 block w-24"
      >
        <VisualMedia
          :source="previewImage"
          :widths="[96, 192]"
          sizes="96px"
          class="overflow-hidden rounded"
        />
      </NuxtLink>
      <div class="flex flex-col justify-between w-full ml-6">
        <!-- Name + options -->
        <div>
          <NuxtLink
            :to="
              localePath(
                resolveUrl({ type: 'product', value: item.product.slug })
              )
            "
            class="inline-block"
          >
            <h4>{{ item.product.name }}</h4>
          </NuxtLink>

          <div
            v-for="bundleItem in bundleItems"
            :key="bundleItem.id"
            class="mt-1 text-sm"
          >
            <span
              >{{ bundleItem.product.name }} &times;
              {{ bundleItem.quantity }}</span
            >

            <div
              v-for="option in bundleItem.options"
              :key="option.name"
              class="pl-2"
            >
              <span v-if="option.value">{{ option.name }}:&nbsp;</span>
              <span>{{ option.value }}</span>
            </div>
          </div>
          <div
            v-for="option in item.options"
            :key="option.name"
            class="mt-1 text-sm"
          >
            <span v-if="option.value">{{ option.name }}:&nbsp;</span>
            <span>{{ option.value }}</span>
          </div>
        </div>

        <!-- Price/quantity + item editor toggle -->
        <div class="clearfix mt-3 leading-none label-sm-bold">
          <div class="inline-block py-1 -mb-1">
            <span v-if="item.quantity > 1">{{ item.quantity }} &times; </span>
            <span>{{ formatMoney(item.price, currency) }}</span>
            <span v-if="subscriptionInterval"
              >/ {{ intervalCount > 1 ? intervalCount : ''
              }}{{ subscriptionInterval }}</span
            >
          </div>
          <button
            type="button"
            class="float-right p-1 -mb-1 -mr-1"
            @click.prevent="itemEditorIsVisible = !itemEditorIsVisible"
          >
            {{
              itemEditorIsVisible
                ? $t('cart.item.closeEdit')
                : $t('cart.item.edit')
            }}
          </button>
        </div>
      </div>
    </div>
    <!-- Item editor -->
    <div v-show="itemEditorIsVisible">
      <div class="flex items-center pb-4 text-sm">
        <button
          type="button"
          class="flex items-center pr-1 mr-3"
          @click.prevent="removeItem()"
        >
          <BaseIcon icon="uil:trash-alt" class="mr-1" />
          <span class="-mb-px">{{ $t('cart.item.remove') }}</span>
        </button>

        <!-- TODO (awaiting list support)
        <button type="button" class="flex items-center pr-1">
          <BaseIcon icon="uil:star" class="mr-1" />
          <span class="-mb-px">Move to saved</span>
        </button>
        -->

        <!-- Quantity adjustment -->
        <div class="flex ml-auto">
          <ProductQuantity
            v-model="quantity"
            :initial-limit="maxQuantity"
            :stock-tracking="item.product.stockTracking"
            :stock-purchasable="item.product.stockPurchasable"
            :stock-level="
              item.variant ? item.variant.stockLevel : item.product.stockLevel
            "
          />
        </div>
      </div>

      <!-- Adjustment error -->
      <div v-if="adjustmentError">
        <p class="w-full text-error text-right pb-4">
          {{ $t('cart.exceedsStockLevel') }}
        </p>
      </div>
    </div>
  </div>
</template>

<script>
// Helpers
import { mapState } from 'vuex'
import get from 'lodash/get'

export default {
  name: 'CartItem',

  props: {
    item: {
      type: Object,
      default: () => {},
    },
    index: {
      type: Number,
      default: 0,
    },
  },

  data() {
    return {
      itemEditorIsVisible: false,
      quantity: 1,
      maxQuantity: 99,
      adjustmentError: false,
      validateCartStock: false,
    }
  },

  async fetch() {
    const { $swell, item } = this

    // Fetch product
    const product = await $swell.products.get(item.product.id)

    let maxQuantity = get(product, 'content.maxQuantity')
    maxQuantity = !maxQuantity
      ? 99
      : typeof maxQuantity === 'string'
      ? Number(maxQuantity)
      : 99
    maxQuantity = !isNaN(maxQuantity) ? maxQuantity : 99

    this.maxQuantity = maxQuantity
    this.quantity = item.quantity
    this.validateCartStock = $swell.settings.get('cart.validateStock')
  },

  computed: {
    ...mapState(['currency']),

    previewImage() {
      return (
        get(this, 'item.variant.images.0') || get(this, 'item.product.images.0')
      )
    },

    bundleItems() {
      if (!this.item.bundle && !this.item.bundleItems) return []
      return this.item.bundleItems
    },

    billingSchedule() {
      const { purchaseOption } = this.item
      if (purchaseOption && purchaseOption.type === 'subscription') {
        return purchaseOption.billingSchedule
      }
      return null
    },

    intervalCount() {
      if (this.billingSchedule) {
        return this.billingSchedule.intervalCount
      }
      return null
    },

    subscriptionInterval() {
      if (this.billingSchedule) {
        return this.$t(
          `products.slug.purchaseOptions.interval.${this.billingSchedule.interval}.short`
        )
      }
      return null
    },
  },

  watch: {
    // Update qty if item has recently been
    item(val) {
      this.quantity = val.quantity
    },
    quantity(val) {
      this.$store.dispatch('updateCartItem', {
        id: this.item.id,
        fieldsToUpdate: { quantity: val },
      })
    },
  },

  methods: {
    removeItem() {
      this.$store.dispatch('removeCartItem', this.item)
    },
  },
}
</script>
