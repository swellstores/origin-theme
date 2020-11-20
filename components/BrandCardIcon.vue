<template functional>
  <div>
    <div v-if="props.brand === 'American Express'" class="w-auto h-6">
      <img class="h-full" src="~/assets/icons/american-express.svg" alt="American Express" />
    </div>

    <div v-else-if="props.brand === 'Diners Club'" class="w-auto h-6">
      <img class="h-full" src="~/assets/icons/diners-club.svg" alt="Diners Club" />
    </div>

    <div v-else-if="props.brand === 'Discover'" class="w-auto h-3">
      <img class="h-full" src="~/assets/icons/discover.svg" alt="Discover" />
    </div>

    <div v-else-if="props.brand === 'JCB'" class="w-auto h-3">
      <img class="h-full" src="~/assets/icons/jcb.svg" alt="JCB" />
    </div>

    <div v-else-if="props.brand === 'MasterCard'" class="w-auto h-6">
      <img class="h-full" src="~/assets/icons/mastercard.svg" alt="MasterCard" />
    </div>

    <div v-else-if="props.brand === 'Visa'" class="w-auto h-4">
      <img class="h-full" src="~/assets/icons/visa.svg" alt="Visa" />
    </div>

    <BaseIcon v-else icon="uil:credit-card" />
  </div>
</template>

<script>
export default {
  props: {
    brand: {
      type: String,
      default: ''
    }
  }
}
</script>
