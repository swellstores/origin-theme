<template>
  <div class="mr-4 flex items-center">
    <button
      type="button"
      class="relative mr-1 inline-block h-6 w-6 rounded-full bg-primary-darkest"
      :class="{
        'cursor-not-allowed opacity-25':
          !stockAvailable || value === 1 || cartIsUpdating,
      }"
      :disabled="!stockAvailable || value === 1 || cartIsUpdating"
      @click.prevent="decrementQuantity()"
    >
      <BaseIcon
        icon="uil:minus"
        size="sm"
        class="center-xy absolute text-primary-lightest"
      />
    </button>

    <input
      class="w-8 p-1 text-center text-xl md:w-10 md:p-2 md:text-2xl"
      type="number"
      min="1"
      :max="limit"
      :value="value"
      @change="setQuantity($event.target.value)"
    />

    <button
      type="button"
      class="relative ml-1 inline-block h-6 w-6 rounded-full bg-primary-darkest"
      :class="{
        'cursor-not-allowed opacity-25':
          !stockAvailable || value === limit || cartIsUpdating,
      }"
      :disabled="!stockAvailable || value === limit || cartIsUpdating"
      @click.prevent="incrementQuantity()"
    >
      <BaseIcon
        icon="uil:plus"
        size="sm"
        class="center-xy absolute text-primary-lightest"
      />
    </button>
  </div>
</template>

<script>
// Helpers
import { mapState } from 'vuex'

export default {
  props: {
    value: {
      type: Number,
      required: true,
    },
    initialLimit: {
      type: Number,
      default: 99,
    },
    stockTracking: {
      type: Boolean,
      default: false,
    },
    stockPurchasable: {
      type: Boolean,
      default: false,
    },
    stockLevel: {
      type: Number,
      default: null,
    },
  },

  data() {
    return {
      limit: 99,
    }
  },

  computed: {
    ...mapState(['cartIsUpdating']),

    stockAvailable() {
      return (
        !this.stockTracking ||
        this.stockPurchasable ||
        (this.stockTracking && this.stockLevel > 0)
      )
    },
  },

  watch: {
    stockLevel() {
      this.setLimit()
    },
  },

  created() {
    this.limit = this.initialLimit
    this.setLimit()
  },

  methods: {
    // Set limit depending on variant
    setLimit() {
      if (!this.stockTracking || this.stockPurchasable) return
      this.limit = this.stockLevel
      const newValue = this.value > this.limit ? this.limit : this.value
      this.setQuantity(newValue)
    },

    // Increment quantity
    incrementQuantity() {
      const newQuantity = this.value + 1
      this.setQuantity(newQuantity)
    },

    // Decrement quantity
    decrementQuantity() {
      const newQuantity = this.value - 1
      this.setQuantity(newQuantity)
    },

    setQuantity(newQuantity) {
      if (isNaN(newQuantity) || +newQuantity <= 0 || !newQuantity) {
        this.$emit('input', 1)
      } else {
        const quantity = Math.min(
          newQuantity % 1 !== 0 ? Math.round(newQuantity) : newQuantity,
          this.limit
        )

        this.$emit('input', quantity)
      }
    },
  },
}
</script>
