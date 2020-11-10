<template>
  <div v-if="customer" class="min-h-100vh relative bg-primary-lighter pt-6 pb-24">
    <!-- Header -->
    <div class="border-b border-primary-med pb-6">
      <div class="container">
        <h3>{{ customer.firstName }} {{ customer.lastName }}</h3>
        <p>{{ customer.email }}</p>
        <a class="flex flex-row items-center pt-2">
          <BaseIcon icon="uil:edit" size="sm" /><span class="ml-2">Edit profile and password</span>
        </a>
      </div>
    </div>

    <div class="py-6">
      <div class="container">
        <InputDropdown
          class="bg-primary-lightest border border-primary-med"
          :options="['Orders & Returns', 'Addresses', 'Payment methods']"
          value="Payment methods"
          @change="view = $event"
        />
      </div>
    </div>

    <div class="container">
      <!-- Address View -->
      <template v-if="view === 'Addresses'">
        <PanelAddress
          v-for="(address, index) in addresses"
          :key="`address-${index}`"
          :address="address"
          @click-open="openEditPanel('address', 'update', address)"
        />

        <button
          class="btn light w-full mt-10"
          type="button"
          @click="openEditPanel('address', 'new')"
        >
          Add new address
        </button>
      </template>

      <!-- Cards View -->
      <template v-if="view === 'Payment methods'">
        <PanelCard
          class="mb-6"
          v-for="(card, index) in cards"
          :key="`card-${index}`"
          :card="card"
          @click-open="openEditPanel('card', 'update', card)"
        />

        <button class="btn light w-full mt-4" type="button" @click="openEditPanel('card', 'new')">
          Add payment method
        </button>
      </template>

      <PanelEditCard
        v-if="editCardPanelIsActive"
        :type="editCardType"
        :card="cardToEdit"
        @new-address="openEditPanel('address', 'new')"
        @click-close="editCardPanelIsActive = false"
      />

      <PanelEditAddress
        v-if="editAddressPanelIsActive"
        :type="editAddressType"
        :address="addressToEdit"
        @click-close="editAddressPanelIsActive = false"
      />
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  async fetch() {
    const { $swell } = this

    // Set component data
    const customer = await $swell.account.get()
    const { results: addresses } = await $swell.account.getAddresses()
    const { results: orders } = await $swell.account.getOrders()
    const { results: cards } = await $swell.account.getCards()

    console.log(customer)

    this.customer = customer
    this.addresses = addresses
    this.orders = orders
    this.cards = cards
  },

  data() {
    return {
      customer: null,
      addresses: null,
      cards: null,
      orders: null,
      cards: null,
      view: 'Payment methods',
      editAddressPanelIsActive: false,
      editAddressType: 'update',
      addressToEdit: null,
      editCardPanelIsActive: false,
      editCardType: 'update',
      cardToEdit: null
    }
  },

  methods: {
    openEditPanel(type, method, existing) {
      switch (type) {
        case 'address':
          this.editAddressPanelIsActive = true
          if (method === 'update') {
            this.editAddressType = 'update'
            this.addressToEdit = existing
          } else {
            this.editAddressType = 'new'
            this.addressToEdit = null
          }
          break
        case 'card':
          this.editCardPanelIsActive = true
          if (method === 'update') {
            this.editCardType = 'update'
            this.cardToEdit = existing
          } else {
            console.log('whytho')
            this.editCardType = 'new'
            this.cardToEdit = null
          }
          break
        default:
          return
      }
    }
  }
}
</script>

<style lang="postcss" scoped></style>
