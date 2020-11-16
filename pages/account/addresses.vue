<template>
  <div class="container">
    <PanelAddress
      class="mb-6"
      v-for="(address, index) in addresses"
      :key="`address-${index}`"
      :address="address"
      @click-open="openEditPanel('update', address)"
    />

    <button class="btn light w-full mt-10" type="button" @click="openEditPanel('new')">
      Add new address
    </button>

    <PanelEditAddress
      v-if="editAddressPanelIsActive"
      :type="editAddressType"
      :address="addressToEdit"
      @click-close="editAddressPanelIsActive = false"
    />
  </div>
</template>

<script>
export default {
  async fetch() {
    // Set page data
    const { results: addresses } = await this.$swell.account.getAddresses()

    this.addresses = addresses
  },

  data() {
    return {
      addresses: null,
      editAddressPanelIsActive: false,
      editAddressType: 'update',
      addressToEdit: null
    }
  },

  methods: {
    openEditPanel(method, existing) {
      switch (method) {
        case 'update':
          this.editAddressPanelIsActive = true
          this.editAddressType = 'update'
          this.addressToEdit = existing
          break
        case 'new':
          this.editAddressPanelIsActive = true
          this.editAddressType = 'new'
          this.addressToEdit = null
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
