<template>
  <div class="container md:pr-0">
    <h1 class="text-4xl hidden md:block mb-9">Payment methods</h1>

    <div v-if="$fetchState.pending" class="container">
      <div class="loader-el w-1/3 h-7 mb-6 mx-auto"></div>
      <div class="loader-el w-3/5 h-2 mb-4 mx-auto"></div>
      <div class="loader-el w-2/5 h-2 mb-8 mx-auto"></div>
    </div>

    <template v-else>
      <template v-if="cards && cards.length">
        <div class="md:grid md:grid-cols-2 md:gap-8">
          <PanelCard
            v-if="defaultCard"
            :card="defaultCard"
            :isDefault="true"
            :class="{ 'md:mb-0 mb-6': otherCards.length }"
            @click-open="openEditPanel('update', defaultCard)"
          />

          <PanelCard
            v-for="(card, index) in otherCards"
            :key="`card-${index}`"
            :card="card"
            :class="{ 'md:mb-0 mb-6': index < otherCards.length - 1 }"
            @click-open="openEditPanel('update', card)"
          />
        </div>
      </template>

      <p v-else class="text-sm text-primary-dark">
        There are no payment methods associated with this account.
      </p>

      <button class="btn w-full md:w-auto light mt-10" type="button" @click="openEditPanel('new')">
        Add new payment method
      </button>

      <PanelEditCard
        v-if="editCardPanelIsActive"
        :type="editCardType"
        :card="cardToEdit"
        :defaultCardId="defaultCardId"
        :refresh="refreshCardPanel"
        @click-close="editCardPanelIsActive = false"
        @new-address="editAddressPanelIsActive = true"
        @refresh="$fetch"
      />

      <PanelEditAddress
        v-if="editAddressPanelIsActive"
        type="new"
        flow="payment"
        @click-close="editAddressPanelIsActive = false"
        @refresh="refreshCardPanel = true"
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
      editCardPanelIsActive: false,
      editCardType: 'update',
      cardToEdit: null,
      editAddressPanelIsActive: false,
      refreshCardPanel: false,
      defaultCardId: ''
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
    openEditPanel(method, existing) {
      switch (method) {
        case 'update':
          this.editCardPanelIsActive = true
          this.editCardType = 'update'
          this.cardToEdit = existing
          break
        case 'new':
          this.editCardPanelIsActive = true
          this.editCardType = 'new'
          this.cardToEdit = null
          break
        default:
          return
      }
    }
  },

  layout: 'account'
}
</script>

<style lang="postcss" scoped></style>
