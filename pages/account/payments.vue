<template>
  <div class="container">
    <PanelCard
      class="mb-6"
      v-for="(card, index) in cards"
      :key="`card-${index}`"
      :card="card"
      @click-open="openEditPanel('update', card)"
    />

    <button class="btn light w-full mt-10" type="button" @click="openEditPanel('new')">
      Add new payment method
    </button>

    <PanelEditCard
      v-if="editCardPanelIsActive"
      :type="editCardType"
      :card="cardToEdit"
      @click-close="editCardPanelIsActive = false"
    />
  </div>
</template>

<script>
export default {
  async fetch() {
    // Set page data
    const { results: cards } = await this.$swell.account.getCards()

    this.cards = cards
  },

  data() {
    return {
      cards: null,
      editCardPanelIsActive: false,
      editCardType: 'update',
      cardToEdit: null
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
