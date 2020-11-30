<template>
  <transition name="editPanel" :duration="700" appear>
    <div class="z-40 fixed inset-0">
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
            <InputText class="mb-6" label="First Name" v-model="firstName" />
            <InputText class="mb-6" label="Last Name" v-model="lastName" />
            <InputText class="mb-6" label="Address" v-model="address1" />
            <InputText class="mb-6" label="Apartment / Floor / Suite" v-model="address2" />
            <InputText class="mb-6" label="City" v-model="city" />

            <div class="flex flex-no-wrap mb-6">
              <div class="w-1/2 mr-3">
                <label class="label-xs-bold-faded block mb-2" for="region-select">Region</label>

                <div class="relative">
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
              </div>
              <InputText class="w-1/2 ml-3" label="Zip Code" v-model="zip" />
            </div>

            <div class="mb-6">
              <label class="label-xs-bold-faded block mb-2" for="country-select">Country</label>

              <div class="relative">
                <country-select
                  id="country-select"
                  class="w-full px-4 py-3 bg-primary-lightest border border-primary-med rounded appearance-none"
                  v-model="country"
                  :country="country"
                  :autocomplete="true"
                />

                <BaseIcon icon="uil:angle-down" class="absolute mr-2 right-0 center-y" />
              </div>
            </div>

            <div v-if="flow === 'default'" class="checkbox mb-6">
              <input type="checkbox" id="set-default" v-model="setDefault" />

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
              class="w-full dark"
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
export default {
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

  methods: {
    async updateAddress() {
      this.isUpdating = true

      try {
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
        }
        
        // Close panel and fetch updated data
        this.isUpdating = true
        this.$emit('click-close')
        this.$emit('refresh')
        this.$store.dispatch('showNotification', { message: 'Address updated.' })
      } catch (err) {
        // TODO: Error handling
        console.log(error)
      }
    },
    async createAddress() {
      try {
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

        // Close panel and fetch updated data
        this.isCreating = false
        this.$emit('click-close')
        this.$emit('refresh')
        this.$store.dispatch('showNotification', { message: 'Address created.' })
        this.$store.dispatch('initializeCustomer')
      } catch (err) {
        console.log(err)
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
        this.$emit('refresh')
        this.$store.dispatch('showNotification', { message: 'Address deleted.', type: 'error' })
      } catch (err) {
        console.log(err)
      }
    }
  },

  created() {
    // Prefill form data for updating existing data
    if (!this.address) return

    this.firstName = this.address.firstName || ''
    this.lastName = this.address.lastName || ''
    this.address1 = this.address.address1 || ''
    this.address2 = this.address.address2 || ''
    this.state = this.address.state || ''
    this.city = this.address.city || ''
    this.zip = this.address.zip || ''
    this.country = this.address.country || ''

    // Set default check state
    if (this.defaultAddressId === this.address.id) this.setDefault = true
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

.checkbox {
  @apply flex pb-1;

  & input {
    @apply p-0 m-0 border-0 appearance-none w-0 h-0 invisible;
  }

  & input:checked + label {
    & .indicator {
      @apply bg-primary-darkest border-primary-darkest;
    }
  }

  & label {
    @apply relative flex items-center appearance-none;

    & .indicator {
      @apply flex justify-center items-center cursor-pointer w-6 h-6 border border-primary-med rounded;
      transition: all 0.2s ease;
    }

    & p {
      @apply ml-0 font-semibold;
    }
  }

  & .check {
    &:hover {
      opacity: 1;
    }
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
