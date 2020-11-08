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
            <InputText class="mb-6" label="Address" v-model="address2" />
            <InputText class="mb-6" label="Apartment / Floor / Suite" v-model="address1" />
            <InputText class="mb-6" label="City" v-model="city" />

            <div class="flex flex-no-wrap mb-6">
              <InputText class="mr-3" label="State" v-model="state" />
              <InputText class="ml-3" label="Zip Code" v-model="zip" />
            </div>

            <div class="checkbox mb-6">
              <input type="checkbox" id="set-default" v-model="setDefault" />

              <label class="w-full" for="set-default">
                <p>Make this my default address</p>
                <div class="indicator ml-auto text-primary-lighter">
                  <BaseIcon icon="uil:check" size="sm" />
                </div>
              </label>
            </div>

            <!-- Duplicate elements to account for fixed bottom buttons -->
            <div class="opacity-0">
              <button class="btn w-full my-4">|</button>
              <button v-if="type === 'update'" class="btn w-full">|</button>
            </div>
          </div>

          <div class="w-full fixed left-0 bottom-0 bg-primary-lighter pb-4">
            <div class="container">
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

              <button v-if="type === 'update'" class="btn light w-full" type="button">
                Delete Address
              </button>
            </div>
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
      country: 'AU',
      setDefault: false
    }
  },

  methods: {
    updateAddress() {},
    async createAddress() {
      try {
        const res = await this.$swell.account.createAddress({
          name: 'Julia Sanchez',
          address1: 'Apartment 16B',
          address2: '2602 Pinewood Drive',
          city: 'Jacksonville',
          state: 'FL',
          zip: '32216',
          country: 'United States',
          phone: '904-504-4760'
        })

        console.log(res)
      } catch (err) {
        console.log(err)
      }
    }
  },

  mounted() {
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
    this.setDefault = this.address.active || false
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
