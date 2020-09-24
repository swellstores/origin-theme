<template>
  <div class="container overflow-hidden">
    <div :class="{ 'border-t': index !== 0 }" class="py-6 flex">
      <NuxtLink
        :to="resolveUrl({ type: 'product', value: item.product.slug })"
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
            :to="resolveUrl({ type: 'product', value: item.product.slug })"
            class="inline-block"
          >
            <h4>{{ item.product.name }}</h4>
          </NuxtLink>
          <div v-for="option in item.options" :key="option.name" class="mt-1 text-sm">
            <span v-if="option.value">{{ option.name }}:&nbsp;</span>
            <span>{{ option.value }}</span>
          </div>
        </div>

        <!-- Price/quantity + item editor toggle -->
        <div class="mt-3 label-sm-bold leading-none clearfix">
          <div class="inline-block py-1 -mb-1">
            <span>${{ item.price.toFixed(2) }}</span>
            <span v-if="item.quantity > 1">&times; {{ item.quantity }}</span>
          </div>
          <button
            type="button"
            class="float-right p-1 -mr-1 -mb-1"
            @click.prevent="itemEditorIsVisible = !itemEditorIsVisible"
          >
            {{ itemEditorIsVisible ? 'Close' : 'Edit' }}
          </button>
        </div>
      </div>
    </div>
    <!-- Item editor -->
    <div v-show="itemEditorIsVisible">
      <div class="flex items-center pb-4 text-sm">
        <button type="button" class="flex items-center mr-3 pr-1" @click.prevent="removeItem()">
          <BaseIcon icon="uil:trash-alt" class="mr-1" />
          <span class="-mb-px">Remove</span>
        </button>

        <!-- TODO (awaiting list support)
        <button type="button" class="flex items-center pr-1">
          <BaseIcon icon="uil:star" class="mr-1" />
          <span class="-mb-px">Move to saved</span>
        </button>
        -->

        <!-- Quantity adjustment -->
        <div class="flex ml-auto">
          <button
            type="button"
            class="relative inline-block w-9 h-9 rounded-full bg-primary-light mr-2"
            @click.prevent="decrementQuantity()"
          >
            <BaseIcon icon="uil:minus" class="absolute center-xy" />
          </button>
          <button
            type="button"
            class="relative inline-block w-9 h-9 rounded-full bg-primary-light"
            @click.prevent="incrementQuantity()"
          >
            <BaseIcon icon="uil:plus" class="absolute center-xy" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// Helpers
import get from 'lodash/get'

export default {
  name: 'CartItem',

  props: {
    item: {
      type: Object,
      default: () => {}
    },
    index: {
      type: Number,
      default: 0
    }
  },

  data() {
    return {
      itemEditorIsVisible: false
    }
  },

  computed: {
    previewImage() {
      return get(this, 'item.product.images.0')
    }
  },

  methods: {
    removeItem() {
      this.$store.dispatch('removeCartItem', this.item)
    },

    incrementQuantity() {
      const oldQuantity = this.item.quantity
      const newQuantity = oldQuantity + 1
      this.$store.dispatch('updateCartItem', {
        id: this.item.id,
        fieldsToUpdate: { quantity: newQuantity }
      })
    },

    decrementQuantity() {
      if (this.item.quantity - 1 <= 0) return
      const oldQuantity = this.item.quantity
      const newQuantity = oldQuantity - 1
      this.$store.dispatch('updateCartItem', {
        id: this.item.id,
        fieldsToUpdate: { quantity: newQuantity }
      })
    }
  }
}
</script>
