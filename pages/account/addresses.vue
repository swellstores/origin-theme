<template>
  <div class="container md:pr-0">
    <h1 class="text-4xl hidden md:block mb-8">{{ $t('account.addresses.title') }}</h1>

    <div v-if="$fetchState.pending">
      <div class="loader-el w-1/3 h-7 mb-6 m-auto"></div>
      <div class="loader-el w-3/5 h-2 mb-4 m-auto"></div>
      <div class="loader-el w-2/5 h-2 mb-8 m-auto"></div>
    </div>

    <template v-else>
      <template v-if="addresses && addresses.length">
        <div class="grid md:hidden gap-8">
          <AccountAddressContainer
            v-if="defaultAddress"
            :address="defaultAddress"
            :is-default="true"
            @click-open="openEditPopup('update', defaultAddress)"
          />

          <template v-if="otherAddresses && otherAddresses.length">
            <span v-if="defaultAddress" class="block md:hidden label-xs-bold-faded">{{
              $t('account.addresses.otherAddresses')
            }}</span>

            <AccountAddressContainer
              v-for="(address, index) in otherAddresses"
              :key="`address-${index}`"
              :address="address"
              :class="{ 'md:mb-0': index < otherAddresses.length - 1 }"
              @click-open="openEditPopup('update', address)"
              @delete-address="
                deletePopupIsActive = true
                addressToDelete = $event
              "
              @set-default="
                defaultPopupIsActive = true
                addressToSetDefault = $event
              "
            />
          </template>
        </div>

        <div class="hidden md:grid md:grid-cols-2 md:auto-rows-fr md:gap-8">
          <AccountAddressContainer
            v-for="(address, index) in sortedAddresses"
            :key="`address-${index}`"
            :address="address"
            :is-default="defaultAddressId === address.id"
            :class="{ 'mb-6 md:mb-0': index < otherAddresses.length - 1 }"
            @click-open="openEditPopup('update', address)"
            @delete-address="
              deletePopupIsActive = true
              addressToDelete = $event
            "
            @set-default="
              defaultPopupIsActive = true
              addressToSetDefault = $event
            "
          />
        </div>
      </template>

      <p v-else class="text-sm text-primary-dark">
        {{ $t('account.addresses.noAddresses') }}
      </p>

      <button class="btn w-full md:w-auto light mt-10" type="button" @click="openEditPopup('new')">
        {{ $t('account.addresses.addAddress') }}
      </button>

      <AccountAddressPopup
        v-if="editAddressPopupIsActive"
        :type="editAddressType"
        :address="addressToEdit"
        :addresses-length="addresses.length"
        :default-address-id="defaultAddressId"
        @click-close="editAddressPopupIsActive = false"
        @refresh="$fetch"
      />

      <AccountConfirmationPopup
        v-if="deletePopupIsActive"
        :heading="$t('account.addresses.deleteAddress.title')"
        :prompt-message="$t('account.addresses.deleteAddress.text')"
        :accept-label="$t('account.addresses.deleteAddress.yes')"
        :refuse-label="$t('account.addresses.deleteAddress.no')"
        :is-loading="isDeleting"
        :loading-label="$t('account.addresses.deleteAddress.loading')"
        @accept="deleteAddress(addressToDelete)"
        @click-close="deletePopupIsActive = false"
      />

      <AccountConfirmationPopup
        v-if="defaultPopupIsActive"
        :heading="$t('account.addresses.setDefaultAddress.title')"
        :prompt-message="$t('account.addresses.setDefaultAddress.text')"
        :accept-label="$t('account.addresses.setDefaultAddress.yes')"
        :refuse-label="$t('account.addresses.setDefaultAddress.no')"
        :is-loading="isUpdating"
        :loading-label="$t('account.addresses.setDefaultAddress.loading')"
        @accept="setDefaultAddress(addressToSetDefault)"
        @click-close="defaultPopupIsActive = false"
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

    if (this.customer.shipping) {
      this.defaultAddressId = this.customer.shipping.accountAddressId
    }

    this.addresses = addresses
  },

  data() {
    return {
      addresses: null,
      editAddressPopupIsActive: false,
      editAddressType: 'update',
      addressToEdit: '',
      addressToDelete: '',
      addressToSetDefault: '',
      defaultAddressId: '',
      deletePopupIsActive: false,
      defaultPopupIsActive: false,
      isDeleting: false,
      isUpdating: false
    }
  },

  computed: {
    ...mapState(['customer']),

    defaultAddress() {
      const { addresses, defaultAddressId } = this
      if (!defaultAddressId || !addresses) return
      return addresses.find(address => address.id === defaultAddressId)
    },
    otherAddresses() {
      const { addresses, defaultAddressId } = this
      if (!defaultAddressId || !addresses) return addresses
      return addresses.filter(address => address.id !== defaultAddressId)
    },
    sortedAddresses() {
      const { addresses } = this
      if (!addresses) return
      return addresses.sort((a, b) => new Date(a.dateCreated) - new Date(b.dateCreated))
    }
  },

  methods: {
    openEditPopup(method, existing) {
      switch (method) {
        case 'update':
          this.editAddressPopupIsActive = true
          this.editAddressType = 'update'
          this.addressToEdit = existing
          break
        case 'new':
          this.editAddressPopupIsActive = true
          this.editAddressType = 'new'
          this.addressToEdit = null
          break
        default:
      }
    },

    async deleteAddress(id) {
      try {
        this.isDeleting = true
        await this.$swell.account.deleteAddress(id)

        // Close Popup and fetch updated data
        this.isDeleting = false
        this.deletePopupIsActive = false
        this.$fetch()
        this.$store.dispatch('showNotification', {
          message: this.$t('account.addresses.deleteAddress.success'),
          type: 'error'
        })
      } catch (err) {
        console.log(err)
      }
    },

    async setDefaultAddress(id) {
      try {
        this.isUpdating = true
        await this.$swell.account.update({
          shipping: {
            accountAddressId: id
          }
        })

        // Close Popup and fetch updated data
        this.isUpdating = false
        this.defaultPopupIsActive = false
        this.$store.dispatch('showNotification', {
          message: this.$t('account.addresses.setDefaultAddress.success')
        })
        this.$store.dispatch('initializeCustomer')
        this.$fetch()
      } catch (err) {
        console.log(err)
      }
    }
  },

  layout: 'account'
}
</script>
