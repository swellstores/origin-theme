<template>
  <div v-if="customer" class="min-h-100vh relative bg-primary-lighter py-6">
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
          value="Addresses"
        />
      </div>
    </div>

    <div class="container">
      <!-- Address View -->
      <template v-if="view === 'Addresses' && addresses">
        <PanelAddress
          v-for="address in addresses"
          :key="address.id"
          :address="address"
          @click-open="openEditAddressPanel('update', address)"
        />

        <button class="btn light w-full mt-10" type="button" @click="openEditAddressPanel('new')">
          Add new address
        </button>

        <PanelEditAddress
          v-if="editAddressPanelIsActive"
          :type="editAddressType"
          :address="addressToEdit"
          @click-close="editAddressPanelIsActive = false"
        />
      </template>
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

    this.customer = customer
    this.addresses = addresses
    this.orders = orders
    this.cards = cards
  },

  data() {
    return {
      customer: null,
      addresses: null,
      orders: null,
      cards: null,
      view: 'Addresses',
      editAddressPanelIsActive: false,
      editAddressType: 'update',
      addressToEdit: null
    }
  },

  methods: {
    openEditAddressPanel(type, address) {
      this.editAddressPanelIsActive = true
      this.editAddressType = type

      if (type === 'update') {
        this.addressToEdit = address
      } else {
        this.addressToEdit = null
      }
    }
  }
}
</script>

<style lang="postcss" scoped></style>
