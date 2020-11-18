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
                <p>Make this my default address</p>
                <div class="indicator ml-auto text-primary-lighter">
                  <BaseIcon icon="uil:check" size="sm" />
                </div>
              </label>
            </div>
          </div>

          <div class="w-full sticky left-0 bottom-0 bg-primary-lighter pb-4">
            <button
              v-if="type === 'new'"
              class="btn dark w-full my-4"
              type="button"
              @click="createAddress"
            >
              Create Address
            </button>

            <button
              v-if="type === 'update'"
              class="btn dark w-full my-4"
              type="button"
              @click="updateAddress"
            >
              Save Address
            </button>

            <button
              v-if="type === 'update'"
              class="btn bg-primary-light hover:bg-error w-full"
              type="button"
              @click="deleteAddress()"
            >
              Delete Address
            </button>
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
      setDefault: false
    }
  },

  methods: {
    async updateAddress() {
      if (this.setDefault) {
        // Set current address as default
        await this.$swell.account.update({
          shipping: {
            accountAddressId: this.address.id
          }
        })

        this.$emit('click-close')
        this.$emit('refresh')
        this.$store.dispatch('showNotification', { message: 'Address updated.' })
      }
    },
    async createAddress() {
      try {
        await this.$swell.account.createAddress({
          name: `${this.firstName} ${this.lastName}`,
          address1: this.address1,
          address2: this.address2,
          city: this.city,
          state: this.state,
          zip: this.zip,
          country: this.country
        })

        // Close panel and fetch updated data
        this.$emit('click-close')
        this.$emit('refresh')
        this.$store.dispatch('showNotification', { message: 'Address created.' })
      } catch (err) {
        console.log(err)
      }
    },
    async deleteAddress() {
      try {
        await this.$swell.account.deleteAddress(this.address.id)

        // Close panel and fetch updated data
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
  @apply absolute bottom-0 left-0 w-full rounded-t bg-primary-lighter overflow-scroll;
  height: calc(100vh - 2rem);
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
}

.editPanel-enter-to .panel,
.editPanel-leave .overlay {
  @apply transform translate-y-0;
}
</style>
