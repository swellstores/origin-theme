<template>
  <div class="container md:pr-0">
    <h1 class="mb-8 hidden text-4xl md:block">
      {{ $t('account.addresses.title') }}
    </h1>

    <div v-if="$fetchState.pending">
      <div class="loader-el m-auto mb-6 h-7 w-1/3" />
      <div class="loader-el m-auto mb-4 h-2 w-3/5" />
      <div class="loader-el m-auto mb-8 h-2 w-2/5" />
    </div>

    <template v-else>
      <template v-if="addresses && addresses.length">
        <div class="grid gap-8 md:hidden">
          <AccountAddressContainer
            v-if="defaultAddress"
            :address="defaultAddress"
            :is-default="true"
            @click-open="openEditPopup('update', defaultAddress)"
          />

          <template v-if="otherAddresses && otherAddresses.length">
            <span
              v-if="defaultAddress"
              class="label-xs-bold-faded block md:hidden"
              >{{ $t('account.addresses.otherAddresses') }}</span
            >

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

        <div class="hidden md:grid md:auto-rows-fr md:grid-cols-2 md:gap-8">
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

      <BaseButton
        class="mt-10 block"
        fit="auto"
        appearance="light"
        :label="$t('account.addresses.addAddress')"
        @click.native="openEditPopup('new')"
      />

      <AccountAddressPopup
        v-if="editAddressPopupIsActive"
        :type="editAddressType"
        :address="addressToEdit"
        :addresses-length="addresses.length"
        :default-address-id="defaultAddressId"
        :is-creating="isCreating"
        :is-loading="isUpdating"
        :is-deleting="isDeleting"
        :deletable="editAddressType === 'update' ? true : false"
        @click-close="editAddressPopupIsActive = false"
        @refresh="$fetch"
        @new="createAccountAddress"
        @update="updateAccountAddress"
        @delete="deleteAccountAddress"
      />

      <AccountConfirmationPopup
        v-if="deletePopupIsActive"
        :heading="$t('account.addresses.deleteAddress.title')"
        :prompt-message="$t('account.addresses.deleteAddress.text')"
        :accept-label="$t('account.addresses.deleteAddress.yes')"
        :refuse-label="$t('account.addresses.deleteAddress.no')"
        :is-loading="isDeleting"
        :loading-label="$t('account.addresses.deleteAddress.loading')"
        @accept="deleteAccountAddress(addressToDelete)"
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
  layout: 'account',
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
      isCreating: false,
      isDeleting: false,
      isUpdating: false,
    }
  },

  async fetch() {
    // Set page data
    const { results: addresses } = await this.$swell.account.listAddresses()

    if (this.customer.shipping) {
      this.defaultAddressId = this.customer.shipping.accountAddressId
    }

    this.addresses = addresses
  },

  head() {
    return { title: this.$t('account.addresses.title') }
  },

  computed: {
    ...mapState(['customer']),

    defaultAddress() {
      const { addresses, defaultAddressId } = this
      if (!defaultAddressId || !addresses) return
      return addresses.find((address) => address.id === defaultAddressId)
    },
    otherAddresses() {
      const { addresses, defaultAddressId } = this
      if (!defaultAddressId || !addresses) return addresses
      return addresses.filter((address) => address.id !== defaultAddressId)
    },
    sortedAddresses() {
      const { addresses } = this
      if (!addresses) return
      return addresses.sort(
        (a, b) => new Date(a.dateCreated) - new Date(b.dateCreated)
      )
    },
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

    async createAccountAddress(address) {
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
          isDefault,
        } = address

        const accountAddress = await this.$swell.account.createAddress({
          name: `${firstName.trim()} ${lastName.trim()}`,
          address1,
          address2,
          city,
          state,
          zip,
          country,
        })

        if (isDefault && accountAddress.id) {
          // Set address as default
          await this.$swell.account.update({
            shipping: {
              accountAddressId: accountAddress.id,
            },
          })
        }

        // Close panel and fetch updated data
        this.isCreating = false
        this.editAddressPopupIsActive = false
        this.$store.dispatch('initializeCustomer')
        this.$store.dispatch('showNotification', {
          message: this.$t('account.addresses.popup.create.success'),
        })
        this.$fetch()
      } catch (err) {
        this.isCreating = false
        this.editAddressPopupIsActive = false
        this.$store.dispatch('showNotification', {
          message: this.$t('account.addresses.popup.create.error'),
          type: 'error',
        })
      }
    },

    async updateAccountAddress(address) {
      try {
        this.isUpdating = true

        const {
          firstName,
          lastName,
          address1,
          address2,
          city,
          state,
          zip,
          country,
          isDefault,
        } = address

        await this.$swell.account.updateAddress(this.addressToEdit.id, {
          name: `${firstName.trim()} ${lastName.trim()}`,
          address1,
          address2,
          city,
          state,
          zip,
          country,
        })

        if (isDefault) {
          // Set current address as default
          await this.$swell.account.update({
            shipping: {
              accountAddressId: this.addressToEdit.id,
            },
          })
        } else if (this.defaultAddressId === this.addressToEdit.id) {
          // If is default, unset it.
          // Set current address as default
          await this.$swell.account.update({
            shipping: {
              accountAddressId: null,
            },
          })
        }

        // Close panel and fetch updated data
        this.isUpdating = true
        this.editAddressPopupIsActive = false
        this.$store.dispatch('initializeCustomer')
        this.$store.dispatch('showNotification', {
          message: this.$t('account.addresses.popup.save.success'),
        })
        this.$fetch()
      } catch (err) {
        this.$store.dispatch('showNotification', {
          message: this.$t('account.addresses.popup.save.error'),
          type: 'error',
        })
      }
    },

    async deleteAccountAddress(address) {
      try {
        this.isDeleting = true
        await this.$swell.account.deleteAddress(address)

        // If deleted address is default, detach it from account model.
        if (this.defaultAddressId === address) {
          await this.$swell.account.update({
            shipping: {
              accountAddressId: null,
              firstName: null,
              lastName: null,
              name: null,
              address1: null,
              address2: null,
              city: null,
              state: null,
              zip: null,
              country: null,
            },
          })
        }

        // Close Popup and fetch updated data
        this.isDeleting = false
        this.deletePopupIsActive = false
        this.editAddressPopupIsActive = false
        this.$store.dispatch('showNotification', {
          message: this.$t('account.addresses.deleteAddress.success'),
          type: 'error',
        })
        this.$fetch()
      } catch (err) {
        this.$store.dispatch('showNotification', {
          message: this.$t('account.addresses.popup.delete.error'),
          type: 'error',
        })
      }
    },

    async setDefaultAddress(id) {
      try {
        this.isUpdating = true
        await this.$swell.account.update({
          shipping: {
            accountAddressId: id,
          },
        })

        // Close Popup and fetch updated data
        this.isUpdating = false
        this.defaultPopupIsActive = false
        this.$store.dispatch('showNotification', {
          message: this.$t('account.addresses.setDefaultAddress.success'),
        })
        this.$store.dispatch('initializeCustomer')
        this.$fetch()
      } catch (err) {}
    },
  },
}
</script>
