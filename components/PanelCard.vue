<template>
  <div class="bg-primary-lightest py-4 rounded shadow-md">
    <div class="px-4">
      <div class="w-full flex pb-6">
        <div class="ml-auto label-xs-bold bg-primary-light rounded p-2">
          Default
        </div>
      </div>

      <!-- TODO: Add card brands -->

      <div class="w-full flex pb-4">
        <p v-if="card.brand === 'American Express'">
          <span class="tracked">···· ···· ···{{ card.last4.slice(0, 1) }} </span>
          {{ card.last4.slice(1, card.last4.length) }}
        </p>
        <p v-else>
          <span class="tracked">···· ···· ···· </span>
          {{ card.last4 }}
        </p>
        <span class="ml-auto">{{ expDate }}</span>
      </div>

      <p class="text-sm">{{ card.billing.name }}</p>
    </div>

    <div class="border-t border-primary-med mt-4 pt-4">
      <div class="w-full flex px-4 text-sm">
        <div>
          <span class="block label-sm-bold mb-2">Billing address</span>
          <p v-if="card.billing.name">{{ card.billing.name }}</p>
          <p v-if="card.billing.address1">
            <template v-if="card.billing.address2">{{ card.billing.address2 }}, </template>
            {{ card.billing.address1 }}
          </p>
          <p v-if="card.billing.city">
            {{ card.billing.city }}
            <template v-if="card.billing.state">
              {{ card.billing.state }}
            </template>
          </p>
          <p v-if="card.billing.zip">{{ card.billing.zip }}</p>
          <p v-if="card.billing.country">{{ card.billing.country }}</p>
        </div>

        <div class="ml-auto mt-auto">
          <button class="px-2" @click="$emit('click-open')">Edit</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    card: {
      type: Object,
      default: null
    }
  },

  computed: {
    formattedCardNumber() {
      const { brand, last4 } = this.card
      if (brand === 'American Express') {
        return `···· ···· ···${last4.substring(0, 1)} ${last4.substring(1, last4.length)}`
      } else {
        return `···· ···· ···· ${last4}`
      }
    },

    expDate() {
      return `${this.card.expMonth} / ${this.card.expYear.toString().slice(-2)}`
    }
  },

  mounted() {
    console.log(this.card)
  }
}
</script>

<style lang="postcss" scoped>
.tracked {
  letter-spacing: 0.25rem;
}
</style>
