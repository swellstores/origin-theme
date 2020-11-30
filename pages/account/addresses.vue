<template>
  <div class="container md:pr-0">
    <div v-if="$fetchState.pending">
      <div class="loader-el w-1/3 h-7 mb-6 m-auto"></div>
      <div class="loader-el w-3/5 h-2 mb-4 m-auto"></div>
      <div class="loader-el w-2/5 h-2 mb-8 m-auto"></div>
    </div>

    <template v-else>
      <template v-if="addresses && addresses.length">
        <div class="md:grid md:grid-cols-2 md:gap-8">
          <PanelAddress
            v-if="defaultAddress"
            :address="defaultAddress"
            :isDefault="true"
            @click-open="openEditPanel('update', defaultAddress)"
          />

          <template v-if="otherAddresses && otherAddresses.length">
            <span class="block md:hidden label-xs-bold-faded my-6">Other addresses</span>

            <PanelAddress
              v-for="(address, index) in otherAddresses"
              :key="`address-${index}`"
              :address="address"
              :class="{ 'mb-6': index < otherAddresses.length - 1 }"
              @click-open="openEditPanel('update', address)"
              @delete-address="
                confirmationPanelIsActive = true
                addressToDelete = $event
              "
            />
          </template>
        </div>
      </template>

      <p v-else class="text-sm text-primary-dark">
        There are no addresses associated with this account.
      </p>

      <button class="btn w-full md:w-auto light mt-10" type="button" @click="openEditPanel('new')">
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

      <PanelConfirmation
        v-if="confirmationPanelIsActive"
        heading="Delete address"
        promptMessage="Are you sure you want to remove this address?"
        acceptLabel="Yes, remove it"
        refuseLabel="No, keep it"
        :isLoading="isDeleting"
        loadingLabel="Removing"
        @accept="deleteAddress(addressToDelete)"
        @click-close="confirmationPanelIsActive = false"
      />
    </template>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  async fetch() {
    // Set page data
    const { results: addresses } = await this.$swell.account.listAddresses()
    const account = await this.$swell.account.get()
    
    if (this.customer.shipping) {
      this.defaultAddressId = this.customer.shipping.accountAddressId
    }
    this.addresses = addresses
  },

  data() {
    return {
      addresses: null,
      editAddressPanelIsActive: false,
      editAddressType: 'update',
      addressToEdit: '',
      addressToDelete: '',
      defaultAddressId: '',
      confirmationPanelIsActive: false,
      isDeleting: false
    }
  },

  computed: {
    ...mapState(['customer']),

    defaultAddress() {
      if (!this.defaultAddressId || !this.addresses) return
      return this.addresses.find(address => address.id === this.defaultAddressId)
    },
    otherAddresses() {
      if (!this.defaultAddressId || !this.addresses) {
        return this.addresses
      }
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
    },

    async deleteAddress(id) {
      try {
        this.isDeleting = true
        await this.$swell.account.deleteAddress(id)

        // Close panel and fetch updated data
        this.isDeleting = false
        this.confirmationPanelIsActive = false
        this.$fetch()
        this.$store.dispatch('showNotification', { message: 'Address deleted.', type: 'error' })
      } catch (err) {
        console.log(err)
      }
    }
  },

  layout: 'account'
}
</script>

<style lang="postcss" scoped></style>
