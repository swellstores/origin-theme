<template>
  <transition name="editPanel" :duration="700" appear>
    <div class="z-40 fixed inset-0">
      <!-- Overlay -->
      <div class="overlay" @click="$emit('click-close')"></div>

      <!-- Panel -->
      <div class="panel">
        <div class="container py-2">
          <div class="flex py-4">
            <h3 v-if="type === 'new'">Add new payment method</h3>
            <h3 v-else>Edit payment method</h3>
            <button class="ml-auto" @click.prevent="$emit('click-close')">
              <BaseIcon icon="uil:multiply" size="sm" />
            </button>
          </div>

          <!-- Fields -->
          <div class="pt-6">
            <InputText
              class="mb-6"
              :class="{ 'tracking-large': type === 'update' }"
              label="Card number"
              :disabled="type === 'update'"
              v-model="cardNumber"
              v-cardformat:formatCardNumber
            />

            <div class="flex flex-no-wrap mb-6">
              <InputText
                :class="type === 'update' ? 'w-full' : 'mr-3'"
                label="Card Expiry"
                v-model="cardExpiry"
                :disabled="type === 'update'"
                v-cardformat:formatCardExpiry
              />
              <InputText
                v-if="type === 'new'"
                class="ml-3"
                label="CVC"
                v-model="cardCVC"
                v-cardformat:formatCardCVC
              />
            </div>

            <div class="checkbox mb-4">
              <input type="checkbox" id="set-default" v-model="setDefault" />

              <label class="w-full" for="set-default">
                <p class="text-sm">Use as default card</p>
                <div class="indicator ml-auto text-primary-lighter">
                  <BaseIcon icon="uil:check" size="sm" />
                </div>
              </label>
            </div>
          </div>
        </div>

        <div class="py-6 border-t border-primary-med">
          <div class="container ">
            <span class="block text-md font-semibold mb-2">Billing address</span>

            <InputDropdown
              :options="formattedAddressOptions"
              :value="
                formattedDefaultAddress ? formattedDefaultAddress : 'Select an existing address'
              "
              id="address-dropdown"
              class="text-sm"
              @change="billingAddress = $event"
            />

            <button class="label-sm-bold mt-6" @click="$emit('new-address')">
              + Add a new address
            </button>
          </div>
        </div>

        <div class="w-full sticky left-0 bottom-0 bg-primary-lighter pb-4 z-30">
          <div class="container">
            <ButtonLoading
              v-if="type === 'new'"
              class="w-full dark my-4"
              @click.native="createCard()"
              label="Create card"
              loadingLabel="Creating"
              :isLoading="isCreating"
              :disabled="isUpdating || isDeleting"
            />

            <ButtonLoading
              v-if="type === 'update'"
              class="w-full dark my-4"
              @click.native="updateCard()"
              label="Save card"
              loadingLabel="Saving"
              :isLoading="isUpdating"
              :disabled="isCreating || isDeleting"
            />

            <ButtonLoading
              v-if="type === 'update'"
              class="w-full light-error"
              @click.native="deleteCard()"
              label="Delete card"
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
import values from 'lodash/values'
import every from 'lodash/every'
import isEmpty from 'lodash/isEmpty'

export default {
  async fetch() {
    // Set component data
    const { results: addresses } = await this.$swell.account.listAddresses()
    this.addresses = addresses
  },

  props: {
    card: {
      type: Object,
      default: null
    },
    type: {
      type: String
    },
    refresh: {
      type: Boolean,
      value: false
    },
    defaultCardId: {
      type: String,
      default: null
    }
  },

  data() {
    return {
      addresses: null,
      cardName: '',
      cardNumber: '',
      cardExpiry: '',
      cardCVC: '',
      setDefault: false,
      billingAddress: null,
      isCreating: false,
      isUpdating: false,
      isDeleting: false
    }
  },

  computed: {
    formattedAddressOptions() {
      if (!this.addresses) return
      return this.addresses.map(address => {
        return {
          value: address,
          label: `${address.name}, ${address.address2 || ''} ${address.address1}, ${
            address.state
          }, ${address.city} ${address.zip}, ${this.getCountryName(address.country)}`
        }
      })
    },
    formattedDefaultAddress() {
      if (!this.card.billing) return
      return `${this.card.billing.name}, ${this.card.billing.address2 || ''} ${
        this.card.billing.address1
      }, ${this.card.billing.state}, ${this.card.billing.city} ${
        this.card.billing.zip
      }, ${this.getCountryName(this.card.billing.country)}`
    },
    expMonth() {
      if (!this.cardExpiry.includes('/')) return
      return this.cardExpiry.split('/')[0].trim()
    },
    expYear() {
      if (!this.cardExpiry.includes('/')) return
      return `20${this.cardExpiry.split('/')[1].trim()}`
    }
  },

  watch: {
    // Watch for refresh request to get newly generated address
    refresh(bool) {
      if (bool) this.$fetch()
    }
  },

  methods: {
    async updateCard() {
      try {
        this.isUpdating = true

        if (this.billingAddress) {
          const res = await this.$swell.account.updateCard(this.card.id, {
            billing: {
              name: this.billingAddress.name,
              address1: this.billingAddress.address1,
              address2: this.billingAddress.address2,
              city: this.billingAddress.city,
              state: this.billingAddress.state,
              zip: this.billingAddress.zip,
              country: this.billingAddress.country
            }
          })
        }

        if (this.setDefault) {
          // Set current card as default
          await this.$swell.account.update({
            billing: {
              accountCardId: this.card.id
            }
          })
        }

        // Close panel and fetch updated data
        this.isUpdating = false
        this.$store.dispatch('showNotification', { message: 'Card updated.' })
        this.$emit('click-close')
        this.$emit('refresh')
      } catch (err) {
        /* TODO: Add error handling */
        console.log(err)
      }
    },

    async createCard() {
      try {
        const { token } = await this.$swell.card.createToken({
          number: this.cardNumber,
          exp_month: this.expMonth,
          exp_year: this.expYear,
          cvc: this.cardCVC
        })

        if (token) {
          const card = await this.$swell.account.createCard({ token })

          if (!card) throw Error('There was an error creating your card.')

          if (this.setDefault) {
            // Set current address as default
            await this.$swell.account.update({
              billing: {
                accountCardId: card.id
              }
            })
          }

          // Close panel and fetch updated data
          this.$emit('click-close')
          this.$emit('refresh')
          this.$store.dispatch('showNotification', { message: 'Card created.' })
        }
      } catch (err) {
        /* TODO: Add error handling */
        console.log(err)
      }
    },

    async deleteCard() {
      try {
        this.isDeleting = true

        await this.$swell.account.deleteCard(this.card.id)

        this.isDeleting = false

        // Close panel and fetch updated data
        this.$emit('click-close')
        this.$emit('refresh')
        this.$store.dispatch('showNotification', { message: 'Card deleted.' })
      } catch (err) {
        /* TODO: Add error handling */
        console.log(err)
      }
    }
  },

  created() {
    // Prefill form data for updating existing data
    if (!this.card) return

    this.cardExpiry = `${this.card.expMonth} / ${this.card.expYear}` || ''

    // Set formatted card number of existing card
    if (!this.card) return
    const { brand, last4 } = this.card
    if (brand === 'American Express') {
      this.cardNumber = `••••  ••••   •••${last4.substring(0, 1)}   ${last4.substring(
        1,
        last4.length
      )}`
    } else {
      this.cardNumber = `••••  ••••   ••••   ${last4}`
    }

    // Set default check state
    if (this.defaultCardId === this.card.id) this.setDefault = true

    // Set default address
    if (this.card.billing && !values(this.card.billing).every(isEmpty)) {
      this.billingAddress = this.card.billing
    }
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
    @apply absolute w-128 h-auto rounded left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2;
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
