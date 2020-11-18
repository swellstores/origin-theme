<template>
  <div class="container">
    <div v-if="$fetchState.pending">
      <div class="loader-el w-1/3 h-7 mb-6 m-auto"></div>
      <div class="loader-el w-3/5 h-2 mb-4 m-auto"></div>
      <div class="loader-el w-2/5 h-2 mb-8 m-auto"></div>
    </div>

    <div v-else>
      <template v-if="addresses && addresses.length">
        <PanelAddress
          v-if="defaultAddress"
          :address="defaultAddress"
          :isDefault="true"
          @click-open="openEditPanel('update', defaultAddress)"
        />

        <template v-if="otherAddresses && otherAddresses.length">
          <span class="block label-xs-bold-faded my-6">Other addresses</span>

          <PanelAddress
            v-for="(address, index) in otherAddresses"
            :key="`address-${index}`"
            :address="address"
            :class="{ 'mb-6': index < otherAddresses.length - 1 }"
            @click-open="openEditPanel('update', address)"
          />
        </template>
      </template>

      <p v-else class="text-sm text-primary-dark">
        There are no addresses associated with this account.
      </p>

      <button class="btn light w-full mt-10" type="button" @click="openEditPanel('new')">
        Add new address
      </button>

      <PanelEditAddress
        v-if="editAddressPanelIsActive"
        :type="editAddressType"
        :address="addressToEdit"
        :defaultAddressId="defaultAddressId"
        @click-close="editAddressPanelIsActive = false"
        @refresh="$fetch"
      />
    </div>
  </div>
</template>

<script>
export default {
  async fetch() {
    // Set page data
    const { results: addresses } = await this.$swell.account.listAddresses()
    const {
      shipping: { accountAddressId: defaultAddressId }
    } = await this.$swell.account.get()

    this.defaultAddressId = defaultAddressId
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

  computed: {
    defaultAddress() {
      if (!this.defaultAddressId || !this.addresses) return
      return this.addresses.find(address => address.id === this.defaultAddressId)
    },
    otherAddresses() {
      if (!this.defaultAddressId || !this.addresses) return
      return this.addresses.filter(address => address.id !== this.defaultAddressId)
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
