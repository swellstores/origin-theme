<template>
  <div class="container overflow-hidden">
    <div
      :class="{ 'border-t border-primary-med': index !== 0 }"
      class="py-6 flex"
    >
      <NuxtLink
        :to="
          localePath(resolveUrl({ type: 'product', value: item.product.slug }))
        "
        class="block w-24 flex-shrink-0"
      >
        <VisualMedia
          :source="previewImage"
          :widths="[96, 192]"
          sizes="96px"
          class="rounded overflow-hidden"
        />
      </NuxtLink>
      <div class="ml-6 w-full flex flex-col justify-between">
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
            v-for="option in item.options"
            :key="option.name"
            class="mt-1 text-sm"
          >
            <span v-if="option.value">{{ option.name }}:&nbsp;</span>
            <span>{{ option.value }}</span>
          </div>
        </div>

        <!-- Price/quantity + item editor toggle -->
        <div class="mt-3 label-sm-bold leading-none clearfix">
          <div class="inline-block py-1 -mb-1">
            <span>{{ formatMoney(item.price, currency) }}</span>
            <span v-if="item.quantity > 1">&times; {{ item.quantity }}</span>
          </div>
          <button
            type="button"
            class="float-right p-1 -mr-1 -mb-1"
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
          class="flex items-center mr-3 pr-1"
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
  },

  computed: {
    ...mapState(['currency']),

    previewImage() {
      return (
        get(this, 'item.variant.images.0') || get(this, 'item.product.images.0')
      )
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
