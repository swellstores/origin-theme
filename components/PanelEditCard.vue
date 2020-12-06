<template>
  <transition name="editPanel" :duration="700" appear>
    <div class="z-40 fixed inset-0">
      <!-- Overlay -->
      <div class="overlay" @click="$emit('click-close')"></div>

      <!-- Panel -->
      <div class="panel">
        <div class="container relative py-2">
          <div class="flex py-4">
            <h3 v-if="type === 'new'">Add new payment method</h3>
            <h3 v-else>Edit payment method</h3>
            <button class="ml-auto" @click.prevent="$emit('click-close')">
              <BaseIcon icon="uil:multiply" size="sm" />
            </button>
          </div>

          <!-- Fields -->
          <div class="pt-6">
            <div class="mb-6">
              <InputText
                class="mb-2"
                :class="{ 'tracking-large': type === 'update' }"
                label="Card number"
                :disabled="type === 'update'"
                v-model="cardNumber"
                v-cardformat:formatCardNumber
              />

              <template v-if="$v.cardNumber.$dirty">
                <span class="label-sm text-error" v-if="!$v.cardNumber.required"
                  >Please enter your card number.</span
                >

                <span class="label-sm text-error" v-else-if="!$v.cardNumber.maxLength"
                  >Please enter a valid card number.</span
                >
              </template>
            </div>

            <div class="flex flex-no-wrap mb-6">
              <div :class="type === 'update' ? 'w-full' : 'w-1/2 mr-3'">
                <InputText
                  label="Card Expiry"
                  v-model="cardExpiry"
                  :disabled="type === 'update'"
                  v-cardformat:formatCardExpiry
                />

                <template v-if="$v.cardExpiry.$dirty">
                  <span class="label-sm text-error" v-if="!$v.cardExpiry.required"
                    >Enter your card expiry date.</span
                  >

                  <span class="label-sm text-error" v-else-if="!$v.cardExpiry.validDate"
                    >Enter a valid expiry date.</span
                  >
                </template>
              </div>

              <div v-if="type === 'new'" class="w-1/2 ml-3">
                <InputText label="CVC" v-model="cardCVC" v-cardformat:formatCardCVC />

                <template v-if="$v.cardCVC.$dirty">
                  <span class="label-sm text-error" v-if="!$v.cardCVC.required"
                    >Enter your card security code.</span
                  >

                  <span
                    class="label-sm text-error"
                    v-else-if="!$v.cardCVC.integer || !$v.cardCVC.maxLength"
                    >Enter a valid card security code.</span
                  >
                </template>
              </div>
            </div>

            <div class="checkbox mb-4">
              <input
                type="checkbox"
                id="set-default"
                v-model="setDefault"
                :disabled="!defaultCardId"
              />

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
              :compact="true"
              :options="formattedAddressOptions"
              :value="
                formattedDefaultAddress ? formattedDefaultAddress : 'Select an existing address'
              "
              id="address-dropdown"
              class="text-sm max-h-48"
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
              label="Add new payment method"
              loadingLabel="Adding"
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
// Helpers
import values from 'lodash/values'
import every from 'lodash/every'
import isEmpty from 'lodash/isEmpty'

// Validation helper
import { validationMixin } from 'vuelidate'
import { required, maxLength, integer, helpers } from 'vuelidate/lib/validators'

const validDate = date => {
  if (!date.includes('/')) return false

  let month = date.split('/')[0].trim()
  let year = date.split('/')[1].trim()

  if (!month || !year || (!year.length === 2 && !year.length === 4)) return false

  if (year.length === 2) {
    year =
      new Date()
        .getFullYear()
        .toString()
        .substring(0, 2) + year
  }

  const currMonth = new Date().getMonth() + 1
  const currYear = new Date().getFullYear()

  const expMonth = parseInt(month, 10)
  const expYear = parseInt(year, 10)

  if (month < 0 || month > 12) return false

  if (expYear > currYear || (expYear === currYear && month >= currMonth)) {
    return true
  } else {
    return false
  }
}

export default {
  mixins: [validationMixin],

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
    },
    newBillingAddress: {
      type: Object,
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
      isDeleting: false,
      formattedDefaultAddress: ''
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
    expMonth() {
      if (!this.cardExpiry.includes('/')) return
      return this.cardExpiry.split('/')[0].trim()
    },
    expYear() {
      if (!this.cardExpiry.includes('/')) return
      const year = this.cardExpiry.split('/')[1].trim()
      // Affix century if year is only two digits
      if (year.length === 2) {
        return (
          new Date()
            .getFullYear()
            .toString()
            .substring(0, 2) + year
        )
      }
      return year
    }
  },

  watch: {
    // Watch for refresh request to get newly generated address
    refresh(bool) {
      if (bool) {
        this.$fetch()

        if (this.newBillingAddress) {
          this.billingAddress = this.newBillingAddress
          this.formattedDefaultAddress = `${this.newBillingAddress.name}, ${this.newBillingAddress
            .address2 || ''} ${this.newBillingAddress.address1}, ${this.newBillingAddress.state}, ${
            this.newBillingAddress.city
          } ${this.newBillingAddress.zip}, ${this.getCountryName(this.newBillingAddress.country)}`
        }
      }
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
        this.$emit('click-close')
        this.$store.dispatch('initializeCustomer')
        this.$store.dispatch('showNotification', { message: 'Payment method updated.' })
        this.$emit('refresh')
      } catch (err) {
        this.$store.dispatch('showNotification', {
          message: 'There was an issue updating your payment method.',
          type: 'error'
        })
      }
    },

    async createCard() {
      try {
        // Validate fields
        this.$v.$touch()
        if (this.$v.$invalid) return

        this.isCreating = true

        const { token } = await this.$swell.card.createToken({
          number: this.cardNumber,
          exp_month: this.expMonth,
          exp_year: this.expYear,
          cvc: this.cardCVC
        })

        if (token) {
          const card = await this.$swell.account.createCard({ token })

          if (!card) throw Error('There was an error creating your Payment method.')

          if (this.setDefault) {
            // Set current address as default
            await this.$swell.account.update({
              billing: {
                accountCardId: card.id
              }
            })
          }

          // Close panel and fetch updated data
          this.isCreating = false
          this.$emit('click-close')
          this.$store.dispatch('initializeCustomer')
          this.$store.dispatch('showNotification', { message: 'Payment method created.' })
          this.$emit('refresh')
        }
      } catch (err) {
        this.isCreating = false
        console.log(err)
        this.$store.dispatch('showNotification', {
          message: 'There was an issue adding your payment method.',
          type: 'error'
        })
      }
    },

    async deleteCard() {
      try {
        this.isDeleting = true

        await this.$swell.account.deleteCard(this.card.id)

        // If set as default, reset account's default card ID.
        if (this.defaultCardId === this.card.id) {
          await this.$swell.account.update({
            billing: {
              accountCardId: null
            }
          })
        }

        this.isDeleting = false

        // Close panel and fetch updated data
        this.$emit('click-close')
        this.$store.dispatch('initializeCustomer')
        this.$store.dispatch('showNotification', { message: 'Payment method deleted.' })
        this.$emit('refresh')
      } catch (err) {
        this.$store.dispatch('showNotification', {
          message: 'There was an issue deleting your payment method.',
          type: 'error'
        })
      }
    }
  },

  created() {
    // Prefill form data for updating existing data
    if (this.card) {
      this.cardExpiry = `${this.card.expMonth} / ${this.card.expYear}` || ''

      // Set formatted card number of existing card
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
        this.formattedDefaultAddress = `${this.card.billing.name}, ${this.card.billing.address2 ||
          ''} ${this.card.billing.address1}, ${this.card.billing.state}, ${
          this.card.billing.city
        } ${this.card.billing.zip}, ${this.getCountryName(this.card.billing.country)}`
      }
    }

    // If there's no default card, force set default
    if (!this.defaultCardId && this.type === 'new') {
      this.setDefault = true
    }
  },

  validations: {
    cardNumber: { required, maxLength: maxLength(19) },
    cardExpiry: { required, validDate },
    cardCVC: { required, integer, maxLength: maxLength(4) }
  }
}
</script>

<style lang="postcss" scoped>
.overlay {
  @apply opacity-50 fixed w-full h-full bg-primary-darker;
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
