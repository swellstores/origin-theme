<template>
  <div>
    <div v-if="brandName === 'american-express'" class="h-6 w-auto">
      <img
        class="h-full"
        src="~/assets/icons/american-express.svg"
        alt="American Express"
      />
    </div>

    <div v-else-if="brandName === 'diners-club'" class="h-6 w-auto">
      <img
        class="h-full"
        src="~/assets/icons/diners-club.svg"
        alt="Diners Club"
      />
    </div>

    <div v-else-if="brandName === 'discover'" class="h-3 w-auto">
      <img class="h-full" src="~/assets/icons/discover.svg" alt="Discover" />
    </div>

    <div v-else-if="brandName === 'jcb'" class="h-3 w-auto">
      <img class="h-full" src="~/assets/icons/jcb.svg" alt="JCB" />
    </div>

    <div v-else-if="brandName === 'mastercard'" class="h-6 w-auto">
      <img
        class="h-full"
        src="~/assets/icons/mastercard.svg"
        alt="MasterCard"
      />
    </div>

    <div v-else-if="brandName === 'visa'" class="h-4 w-auto">
      <img class="h-full" src="~/assets/icons/visa.svg" alt="Visa" />
    </div>

    <BaseIcon v-else icon="uil:credit-card" />
  </div>
</template>

<script>
import kebabCase from 'lodash/kebabCase'

export default {
  props: {
    brand: {
      type: String,
      default: '',
    },
  },

  computed: {
    brandName() {
      return kebabCase(this.brand)
    },
  },
}
</script>
