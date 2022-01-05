<template>
  <div class="py-4 rounded shadow-md bg-primary-lightest">
    <div class="px-4">
      <div class="flex w-full pb-6">
        <BrandCardIcon :brand="card.brand" />

        <div
          v-if="isDefault"
          class="p-2 ml-auto rounded label-xs-bold bg-primary-light"
        >
          {{ $t('account.payments.card.default') }}
        </div>
      </div>

      <div class="flex w-full pb-4">
        <p v-if="card.brand === 'American Express'">
          <span class="tracking-large"
            >···· ···· ···{{ card.last4.slice(0, 1) }}
          </span>
          {{ card.last4.slice(1, card.last4.length) }}
        </p>
        <p v-else>
          <span class="tracking-large">···· ···· ···· </span>
          {{ card.last4 }}
        </p>
        <span class="ml-auto">{{ expDate }}</span>
      </div>
      <p v-if="card.billing && card.billing.name">
        {{ card.billing.name }}
      </p>
    </div>

    <div class="pt-4 mt-4 border-t border-primary-med">
      <div class="flex w-full px-4 text-sm">
        <div>
          <span class="block mb-2 label-sm-bold">{{
            $t('account.payments.card.billingAddress')
          }}</span>
          <template v-if="card.billing">
            <p v-if="card.billing.name">
              {{ card.billing.name }}
            </p>
            <p v-if="card.billing.address1">
              <template v-if="card.billing.address2">
                {{ card.billing.address2 }},
              </template>
              {{ card.billing.address1 }}
            </p>
            <p v-if="card.billing.city">
              {{ card.billing.city }}
              <template v-if="card.billing.zip">
                {{ card.billing.zip }}
              </template>
            </p>
            <p v-if="card.billing.state">
              {{ card.billing.state }}
              <template v-if="card.billing.country">
                {{ card.billing.country }}
              </template>
            </p>
          </template>

          <p v-else>
            {{ $t('account.payments.card.noBillingAddress') }}
          </p>
        </div>

        <div class="mt-auto ml-auto">
          <button class="px-2" @click="$emit('click-open')">
            {{ $t('account.payments.card.edit') }}
          </button>
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
      default: null,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },

  computed: {
    formattedCardNumber() {
      const { brand, last4 } = this.card
      if (brand === 'American Express') {
        return `···· ···· ···${last4.substring(0, 1)} ${last4.substring(
          1,
          last4.length
        )}`
      } else {
        return `···· ···· ···· ${last4}`
      }
    },

    expDate() {
      const { expMonth, expYear } = this.card
      const mm = expMonth.toString().padStart(2, '0')
      const yy = expYear.toString().slice(-2)
      return `${mm} / ${yy}`
    },
  },
}
</script>
