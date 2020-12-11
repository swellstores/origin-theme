<template>
  <transition name="editPanel" :duration="700" appear>
    <div class="z-40 fixed inset-0" v-enter-key="handleEnterKey">
      <!-- Overlay -->
      <div class="overlay" @click="$emit('click-close')"></div>

      <!-- Panel -->
      <div class="panel">
        <div class="container py-2">
          <div class="flex py-4">
            <h3 v-if="type === 'new'">Add new address</h3>
            <h3 v-else>Edit address</h3>
            <button class="ml-auto" @click.prevent="$emit('click-close')">
              <BaseIcon icon="uil:multiply" size="sm" />
            </button>
          </div>

          <!-- Fields -->
          <div class="pt-6">
            <div class="mb-6">
              <InputText class="mb-2" label="First Name" v-model="firstName" />
              <template v-if="$v.firstName.$dirty">
                <span class="label-sm text-error" v-if="!$v.firstName.required"
                  >Please enter your first name.</span
                >

                <span class="label-sm text-error" v-if="!$v.firstName.maxLength"
                  >First name cannot exceed 40 characters.</span
                >
              </template>
            </div>

            <div class="mb-6">
              <InputText class="mb-2" label="Last Name" v-model="lastName" />
              <template v-if="$v.lastName.$dirty">
                <span class="label-sm text-error" v-if="!$v.lastName.required"
                  >Please enter your last name.</span
                >

                <span class="label-sm text-error" v-if="!$v.lastName.maxLength"
                  >Last name cannot exceed 40 characters.</span
                >
              </template>
            </div>

            <div class="mb-6">
              <InputText class="mb-2" label="Address" v-model="address1" />
              <template v-if="$v.address1.$dirty">
                <span class="label-sm text-error" v-if="!$v.address1.required"
                  >Please enter your address.</span
                >
              </template>
            </div>

            <InputText class="mb-6" label="Apartment / Floor / Suite" v-model="address2" />

            <div class="mb-6">
              <InputText class="mb-2" label="City" v-model="city" />
              <template v-if="$v.city.$dirty">
                <span class="label-sm text-error" v-if="!$v.city.required"
                  >Please enter your address.</span
                >
              </template>
            </div>

            <div class="flex flex-no-wrap mb-6">
              <div class="w-1/2 mr-3">
                <label class="label-xs-bold-faded block mb-2" for="region-select">Region</label>

                <div class="relative mb-2">
                  <region-select
                    id="region-select"
                    class="w-full pl-4 pr-6 py-3 bg-primary-lightest border border-primary-med rounded appearance-none truncate"
                    v-model="state"
                    :country="country"
                    :region="state"
                    :disablePlaceholder="true"
                  />

                  <div>
                    <BaseIcon icon="uil:angle-down" class="absolute mr-2 right-0 center-y" />
                  </div>
                </div>

                <template v-if="$v.state.$dirty">
                  <span class="label-sm text-error" v-if="!$v.state.required"
                    >Region required.</span
                  >
                </template>
              </div>

              <div class="w-1/2 ml-3">
                <InputText class="mb-2" label="Zip Code" v-model="zip" />

                <template v-if="$v.zip.$dirty">
                  <span class="label-sm text-error" v-if="!$v.zip.required"
                    >Zip code required.</span
                  >
                </template>
              </div>
            </div>

            <div class="mb-6">
              <label class="label-xs-bold-faded block mb-2" for="country-select">Country</label>

              <div class="relative mb-2">
                <country-select
                  id="country-select"
                  class="w-full px-4 py-3 bg-primary-lightest border border-primary-med rounded appearance-none"
                  v-model="country"
                  :country="country"
                  :autocomplete="true"
                />

                <BaseIcon icon="uil:angle-down" class="absolute mr-2 right-0 center-y" />
              </div>

              <template v-if="$v.state.$dirty">
                <span class="label-sm text-error" v-if="!$v.country.required"
                  >Country required.</span
                >
              </template>
            </div>

            <div v-if="flow === 'default'" class="checkbox mb-6">
              <input
                type="checkbox"
                id="set-default"
                v-model="setDefault"
                :disabled="disableDefaultOption"
              />

              <label class="w-full" for="set-default">
                <p>Make this my default shipping address</p>
                <div class="indicator ml-auto text-primary-lighter">
                  <BaseIcon icon="uil:check" size="sm" />
                </div>
              </label>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="w-full sticky left-0 bottom-0 bg-primary-lighter pb-4">
            <ButtonLoading
              v-if="type === 'new'"
              class="w-full dark mt-4"
              @click.native="createAddress()"
              label="Create address"
              loadingLabel="Creating"
              :isLoading="isCreating"
              :disabled="isUpdating || isDeleting"
            />

            <ButtonLoading
              v-if="type === 'update'"
              class="w-full dark my-4"
              @click.native="updateAddress()"
              label="Save address"
              loadingLabel="Saving"
              :isLoading="isUpdating"
              :disabled="isCreating || isDeleting"
            />

            <ButtonLoading
              v-if="type === 'update'"
              class="w-full light-error"
              @click.native="deleteAddress()"
              label="Delete address"
              loadingLabel="Deleting"
              :isLoading="isDeleting"
              :disabled="isCreating || isUpdating"
            />
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import { validationMixin } from 'vuelidate'
import { required, maxLength, integer, minValue } from 'vuelidate/lib/validators'

export default {
  mixins: [validationMixin],

  props: {
    address: {
      type: Object,
      default: null
    },
    type: {
      type: String,
      default: 'update'
    },
    flow: {
      type: String,
      default: 'default'
    },
    defaultAddressId: {
      type: String,
      default: null
    },
    addressesLength: {
      type: Number,
      default: 0
    }
  },

  data() {
    return {
      firstName: '',
      lastName: '',
      address1: '',
      address2: '',
      state: '',
      city: '',
      zip: '',
      country: '',
      setDefault: false,
      isCreating: false,
      isUpdating: false,
      isDeleting: false
    }
  },

  computed: {
    disableDefaultOption() {
      // Disable if no default address is set and no addresses exist
      if (!this.defaultAddressId && !this.addressesLength) return true
      // Disable if current address is the only one and default
      if (this.address) {
        if (this.defaultAddressId === this.address.id && this.addressesLength === 1) return true
      }
      return false
    }
  },

  methods: {
    async updateAddress() {
      try {
        // Validate fields
        this.$v.$touch()
        if (this.$v.$invalid) return

        this.isUpdating = true

        const res = await this.$swell.account.updateAddress(this.address.id, {
          name: `${this.firstName.trim()} ${this.lastName.trim()}`,
          address1: this.address1,
          address2: this.address2,
          city: this.city,
          state: this.state,
          zip: this.zip,
          country: this.country
        })

        if (this.setDefault) {
          // Set current address as default
          await this.$swell.account.update({
            shipping: {
              accountAddressId: this.address.id
            }
          })
        } else {
          // If is default, unset it.
          if (this.defaultAddressId === this.address.id) {
            console.log('aha')
            // Set current address as default
            await this.$swell.account.update({
              shipping: {
                accountAddressId: null
              }
            })
          }
        }

        // Close panel and fetch updated data
        this.isUpdating = true
        this.$emit('click-close')
        this.$store.dispatch('initializeCustomer')
        this.$store.dispatch('showNotification', { message: 'Address updated.' })
        this.$emit('refresh')
      } catch (err) {
        this.$store.dispatch('showNotification', {
          message: 'There was an error updating this address.',
          type: 'error'
        })
      }
    },
    async createAddress() {
      try {
        // Validate fields
        this.$v.$touch()
        if (this.$v.$invalid) return

        this.isCreating = true

        const address = await this.$swell.account.createAddress({
          name: `${this.firstName.trim()} ${this.lastName.trim()}`,
          address1: this.address1,
          address2: this.address2,
          city: this.city,
          state: this.state,
          zip: this.zip,
          country: this.country
        })

        if (this.setDefault && address.id) {
          // Set address as default
          await this.$swell.account.update({
            shipping: {
              accountAddressId: address.id
            }
          })
        }

        if (this.flow === 'payment') {
          this.$emit('new-billing-address', address)
        }

        // Close panel and fetch updated data
        this.isCreating = false
        this.$emit('click-close')
        this.$store.dispatch('initializeCustomer')
        this.$store.dispatch('showNotification', { message: 'Address created.' })
        this.$emit('refresh')
      } catch (err) {
        this.$store.dispatch('showNotification', {
          message: 'There was an error creating the address.',
          type: 'error'
        })
      }
    },
    async deleteAddress() {
      try {
        this.isDeleting = true
        await this.$swell.account.deleteAddress(this.address.id)

        // If deleted address is default, detach it from account model.
        if (this.defaultAddressId === this.address.id) {
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
              country: null
            }
          })
        }

        // Close panel and fetch updated data
        this.isDeleting = false
        this.$emit('click-close')
        this.$store.dispatch('initializeCustomer')
        this.$store.dispatch('showNotification', { message: 'Address deleted.', type: 'error' })
        this.$emit('refresh')
      } catch (err) {
        this.$store.dispatch('showNotification', {
          message: 'There was an error deleting the address.',
          type: 'error'
        })
      }
    },

    async handleEnterKey() {
      switch (this.type) {
        case 'update':
          await this.updateAddress()
          break
        case 'new':
          await this.createAddress()
          break
        default:
          return
      }
    }
  },

  created() {
    // Prefill form data for updating existing
    if (this.address) {
      this.firstName = this.address.firstName || ''
      this.lastName = this.address.lastName || ''
      this.address1 = this.address.address1 || ''
      this.address2 = this.address.address2 || ''
      this.state = this.address.state || ''
      this.city = this.address.city || ''
      this.zip = this.address.zip || ''
      this.country = this.address.country || ''

      // Set default check state
      if (this.defaultAddressId === this.address.id) {
        this.setDefault = true
      }
    }

    // If there's no default card, force set default
    if (!this.defaultAddressId && !this.addressesLength && this.type === 'new') {
      this.setDefault = true
    }
  },

  validations: {
    firstName: { required, maxLength: maxLength(40) },
    lastName: { required, maxLength: maxLength(40) },
    address1: { required },
    city: { required },
    state: { required },
    zip: { required },
    country: { required }
  }
}
</script>

<style lang="postcss" scoped>
.overlay {
  @apply opacity-50 absolute w-full h-full bg-primary-darker;
}

.panel {
  @apply w-full absolute bottom-0 rounded-t bg-primary-lighter overflow-scroll;
  height: calc(100vh - 2rem);

  @screen md {
    @apply relative w-128 h-auto rounded left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2;
    max-height: 80vh;
  }
}

.editPanel-enter-active .overlay,
.editPanel-leave-active .overlay {
  @apply transition-all duration-500 ease-in-out;
}

.editPanel-enter .overlay,
.editPanel-leave-to .overlay {
  @apply opacity-0;
}

.editPanel-enter-to .overlay,
.editPanel-leave .overlay {
  @apply opacity-50;
}

.editPanel-enter-active .panel,
.editPanel-leave-active .panel {
  @apply transition-all duration-700;
  transition-timing-function: cubic-bezier(0.6, 0.2, 0, 1);
}

.editPanel-enter .panel,
.editPanel-leave-to .panel {
  @apply transform translate-y-full;

  @screen md {
    transform: translate(-50%, calc(-50% + 5rem));
    opacity: 0;
  }
}

.editPanel-enter-to .panel,
.editPanel-leave .overlay {
  @apply transform translate-y-0;

  @screen md {
    transform: translate(-50%, -50%);
    opacity: 1;
  }
}
</style>
