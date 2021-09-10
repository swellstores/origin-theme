<template>
  <div class="bg-primary-lightest py-4 rounded shadow-md">
    <div class="px-4">
      <div class="w-full flex pb-6">
        <BrandCardIcon :brand="card.brand" />

        <div
          v-if="isDefault"
          class="ml-auto label-xs-bold bg-primary-light rounded p-2"
        >
          {{ $t('account.payments.card.default') }}
        </div>
      </div>

      <div class="w-full flex pb-4">
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

    <div class="border-t border-primary-med mt-4 pt-4">
      <div class="w-full flex px-4 text-sm">
        <div>
          <span class="block label-sm-bold mb-2">{{
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

        <div class="ml-auto mt-auto">
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
      const mm = this.card.expMonth.padStart(2, '0')
      const yy = this.card.expYear.toString().slice(-2)
      return `${mm} / ${yy}`
    },
  },
}
</script>
