<template>
  <div class="container md:pr-0">
    <h1 class="text-4xl hidden md:block mb-9">{{ $t('account.payments.title') }}</h1>

    <div v-if="$fetchState.pending" class="container">
      <div class="loader-el w-1/3 h-7 mb-6 mx-auto"></div>
      <div class="loader-el w-3/5 h-2 mb-4 mx-auto"></div>
      <div class="loader-el w-2/5 h-2 mb-8 mx-auto"></div>
    </div>

    <template v-else>
      <template v-if="cards && cards.length">
        <div class="md:grid md:grid-cols-2 md:gap-8">
          <AccountCardContainer
            v-if="defaultCard"
            :card="defaultCard"
            :is-default="true"
            :class="{ 'md:mb-0 mb-6': otherCards.length }"
            @click-open="openEditPopup('update', defaultCard)"
          />

          <AccountCardContainer
            v-for="(card, index) in otherCards"
            :key="`card-${index}`"
            :card="card"
            :class="{ 'md:mb-0 mb-6': index < otherCards.length - 1 }"
            @click-open="openEditPopup('update', card)"
          />
        </div>
      </template>

      <p v-else class="text-sm text-primary-dark">
        {{ $t('account.payments.noPaymentMethods') }}
      </p>

      <button class="btn w-full md:w-auto light mt-10" type="button" @click="openEditPopup('new')">
        {{ $t('account.payments.addPaymentMethod') }}
      </button>

      <AccountCardPopup
        v-if="editCardPopupIsActive"
        :type="editCardType"
        :card="cardToEdit"
        :cards-length="cards.length"
        :default-card-id="defaultCardId"
        :refresh="refreshCardPopup"
        :new-billing-address="newBillingAddress"
        @click-close="editCardPopupIsActive = false"
        @new-address="editAddressPopupIsActive = true"
        @refresh="$fetch"
      />

      <AccountAddressPopup
        v-if="editAddressPopupIsActive"
        type="new"
        flow="payment"
        :is-creating="isCreating"
        @click-close="editAddressPopupIsActive = false"
        @new-billing-address="createAccountAddress"
      />
    </template>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  async fetch() {
    // Set page data
    const { results: cards } = await this.$swell.account.listCards()

    if (this.customer.billing) this.defaultCardId = this.customer.billing.accountCardId
    this.cards = cards
  },

  data() {
    return {
      cards: null,
      editCardPopupIsActive: false,
      editCardType: 'update',
      cardToEdit: null,
      editAddressPopupIsActive: false,
      refreshCardPopup: false,
      defaultCardId: '',
      newBillingAddress: null,
      isCreating: false
    }
  },

  computed: {
    ...mapState(['customer']),
    defaultCard() {
      if (!this.defaultCardId || !this.cards) return
      return this.cards.find(card => card.id === this.defaultCardId)
    },
    otherCards() {
      if (!this.defaultCardId || !this.cards) {
        return this.cards
      }
      return this.cards.filter(card => card.id !== this.defaultCardId)
    }
  },

  methods: {
    async createAccountAddress(addr) {
      try {
        this.isCreating = true

        const {
          firstName,
          lastName,
          address1,
          address2,
          city,
          state,
          zip,
          country,
          isDefault
        } = addr

        const address = await this.$swell.account.createAddress({
          name: `${firstName.trim()} ${lastName.trim()}`,
          address1,
          address2,
          city,
          state,
          zip,
          country
        })

        if (isDefault && address.id) {
          // Set address as default
          await this.$swell.account.update({
            shipping: {
              accountAddressId: address.id
            }
          })
        }

        this.newBillingAddress = address

        // Close panel and fetch updated data
        this.isCreating = false
        this.editAddressPopupIsActive = false
        this.$store.dispatch('initializeCustomer')
        this.$store.dispatch('showNotification', {
          message: this.$t('account.addresses.popup.create.success')
        })
      } catch (err) {
        this.$store.dispatch('showNotification', {
          message: this.$t('account.addresses.popup.create.error'),
          type: 'error'
        })
      }
    },

    openEditPopup(method, existing) {
      switch (method) {
        case 'update':
          this.editCardPopupIsActive = true
          this.editCardType = 'update'
          this.cardToEdit = existing
          break
        case 'new':
          this.editCardPopupIsActive = true
          this.editCardType = 'new'
          this.cardToEdit = null
          break
        default:
      }
    }
  },

  layout: 'account'
}
</script>
