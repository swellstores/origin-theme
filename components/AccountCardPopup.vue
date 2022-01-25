<template>
  <transition name="popup" :duration="700" appear>
    <div class="fixed inset-0 z-40" @keyup.enter="handleEnterKey">
      <!-- Overlay -->
      <div
        class="overlay absolute h-full w-full bg-primary-darker opacity-50"
        @click="$emit('click-close')"
      />

      <!-- Panel -->
      <div
        class="panel h-vh-gap md:center-xy absolute bottom-0 w-full overflow-scroll rounded-t bg-primary-lighter md:relative md:h-auto md:max-h-80vh md:w-128 md:rounded"
      >
        <div class="container pt-2 pb-4 md:pb-0">
          <div class="flex py-4">
            <h3 v-if="type === 'new'">
              {{ $t('account.payments.popup.new.title') }}
            </h3>
            <h3 v-else>
              {{ $t('account.payments.popup.edit.title') }}
            </h3>
            <button class="ml-auto" @click.prevent="$emit('click-close')">
              <BaseIcon icon="uil:multiply" size="sm" />
            </button>
          </div>

          <!-- Fields -->
          <div class="pt-6 pb-4">
            <div class="mb-6">
              <InputText
                v-model="cardNumber"
                v-cardformat:formatCardNumber
                class="mb-2"
                :class="{ 'tracking-large': type === 'update' }"
                :label="$t('account.payments.popup.cardNumber.label')"
                name="ccNumber"
                autocomplete="cc-number"
                :disabled="type === 'update'"
              />

              <template v-if="$v.cardNumber.$dirty">
                <span
                  v-if="!$v.cardNumber.required"
                  class="label-sm text-error-default"
                  >{{ $t('account.payments.popup.cardNumber.required') }}</span
                >

                <span
                  v-else-if="!$v.cardNumber.maxLength"
                  class="label-sm text-error-default"
                  >{{
                    $t('account.payments.popup.cardNumber.maxLength', { n: 19 })
                  }}</span
                >
              </template>
            </div>

            <div class="flex-no-wrap mb-6 flex">
              <div :class="type === 'update' ? 'w-full' : 'mr-3 w-1/2'">
                <InputText
                  v-model="cardExpiry"
                  v-cardformat:formatCardExpiry
                  :label="$t('account.payments.popup.cardExpiry.label')"
                  :disabled="type === 'update'"
                  name="ccExpiry"
                  autocomplete="cc-exp"
                />

                <template v-if="$v.cardExpiry.$dirty">
                  <span
                    v-if="!$v.cardExpiry.required"
                    class="label-sm text-error-default"
                    >{{
                      $t('account.payments.popup.cardExpiry.required')
                    }}</span
                  >

                  <span
                    v-else-if="!$v.cardExpiry.validDate"
                    class="label-sm text-error-default"
                    >{{ $t('account.payments.popup.cardExpiry.date') }}</span
                  >
                </template>
              </div>

              <div v-if="type === 'new'" class="ml-3 w-1/2">
                <InputText
                  v-model="cardCVC"
                  v-cardformat:formatCardCVC
                  :label="$t('account.payments.popup.cvc.label')"
                  name="ccCVC"
                  autocomplete="cc-csc"
                />

                <template v-if="$v.cardCVC.$dirty">
                  <span
                    v-if="!$v.cardCVC.required"
                    class="label-sm text-error-default"
                    >{{ $t('account.payments.popup.cvc.required') }}</span
                  >

                  <span
                    v-else-if="
                      !$v.cardCVC.integer ||
                      !$v.cardCVC.minLength ||
                      !$v.cardCVC.maxLength
                    "
                    class="label-sm text-error-default"
                    >{{ $t('account.payments.popup.cvc.format') }}</span
                  >
                </template>
              </div>
            </div>

            <div class="checkbox mb-4">
              <input
                id="set-default"
                v-model="setDefault"
                type="checkbox"
                :disabled="disableDefaultOption"
              />

              <label class="w-full" for="set-default">
                <p class="text-sm">
                  {{ $t('account.payments.popup.card.setAsDefault') }}
                </p>
                <div class="indicator ml-auto text-primary-lighter">
                  <BaseIcon icon="uil:check" size="sm" />
                </div>
              </label>
            </div>
          </div>
        </div>

        <div class="container border-t border-primary-med pt-6 pb-4">
          <div class="mb-6 md:mb-0">
            <span class="text-md mb-2 block font-semibold">{{
              $t('account.payments.popup.billingAddress')
            }}</span>

            <InputDropdown
              v-if="addresses && addresses.length"
              id="address-dropdown"
              :compact="true"
              :options="formattedAddressOptions"
              :value="
                formattedDefaultAddress
                  ? formattedDefaultAddress
                  : 'Select an existing address'
              "
              class="max-h-48 text-sm"
              @change="billingAddress = $event"
            />
            <span v-else class="block text-sm text-primary-dark">{{
              $t('account.payments.popup.noBillingAddress')
            }}</span>

            <button class="label-sm-bold mt-6" @click="$emit('new-address')">
              + {{ $t('account.payments.popup.newBillingAddress') }}
            </button>
          </div>

          <!-- Duplicate button elements to match fixed content below -->
          <div
            class="pointer-events-none invisible block grid gap-y-4 md:hidden"
          >
            <div v-if="type === 'new'" class="btn">|</div>
            <div v-if="type === 'update'" class="btn">|</div>
            <div v-if="type === 'update'" class="btn">|</div>
          </div>
        </div>

        <!-- Action buttons -->
        <div
          class="center-x container fixed bottom-0 grid w-full gap-y-4 bg-primary-lighter py-4 md:sticky md:left-0 md:transform-none"
        >
          <BaseButton
            v-if="type === 'new'"
            appearance="dark"
            :label="$t('account.payments.popup.create.button.label')"
            :loading-label="
              $t('account.payments.popup.create.button.loadingLabel')
            "
            :is-loading="isCreating"
            :disabled="isUpdating || isDeleting"
            @click.native="createCard()"
          />

          <BaseButton
            v-if="type === 'update'"
            appearance="dark"
            :label="$t('account.payments.popup.save.button.label')"
            :loading-label="$t('account.payments.save.button.label')"
            :is-loading="isUpdating"
            :disabled="isCreating || isDeleting"
            @click.native="updateCard()"
          />

          <BaseButton
            v-if="type === 'update'"
            appearance="light-error"
            :label="$t('account.payments.popup.delete.button.label')"
            :loading-label="
              $t('account.payments.popup.delete.button.loadingLabel')
            "
            :is-loading="isDeleting"
            :disabled="isCreating || isUpdating"
            @click.native="deleteCard()"
          />
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
// Helpers
import values from 'lodash/values'
import isEmpty from 'lodash/isEmpty'

// Validation helper
import { validationMixin } from 'vuelidate'
import {
  required,
  minLength,
  maxLength,
  integer,
} from 'vuelidate/lib/validators'

const validDate = (date) => {
  if (!date.includes('/')) return false

  const month = date.split('/')[0].trim()
  let year = date.split('/')[1].trim()

  if (!month || !year || (!year.length === 2 && !year.length === 4))
    return false

  if (year.length === 2) {
    year = new Date().getFullYear().toString().substring(0, 2) + year
  }

  const currMonth = new Date().getMonth() + 1
  const currYear = new Date().getFullYear()

  const expMonth = parseInt(month, 10)
  const expYear = parseInt(year, 10)

  if (month < 0 || month > 12) return false

  if (expYear > currYear || (expYear === currYear && expMonth >= currMonth)) {
    return true
  } else {
    return false
  }
}

export default {
  mixins: [validationMixin],

  props: {
    card: {
      type: Object,
      default: null,
    },
    cardsLength: {
      type: Number,
      default: 0,
    },
    type: {
      type: String,
      default: '',
    },
    refresh: {
      type: Boolean,
      value: false,
    },
    defaultCardId: {
      type: String,
      default: null,
    },
    newBillingAddress: {
      type: Object,
      default: null,
    },
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
      formattedDefaultAddress: '',
    }
  },

  async fetch() {
    // Set component data
    const { results: addresses } = await this.$swell.account.listAddresses()
    this.addresses = addresses
  },

  computed: {
    formattedAddressOptions() {
      if (!this.addresses) return
      return this.addresses.map((address) => {
        return {
          value: address,
          label: `${address.name}, ${address.address2 || ''} ${
            address.address1
          }, ${address.state}, ${address.city} ${address.zip}, ${
            address.country
          }`,
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
        return new Date().getFullYear().toString().substring(0, 2) + year
      }
      return year
    },
    disableDefaultOption() {
      // Disable if no default card is set and no cards exist
      if (!this.defaultCardId && !this.cardsLength) return true
      // Disable if current card is the only one and default
      if (this.card) {
        if (this.defaultCardId === this.card.id && this.cardsLength === 1)
          return true
      }
      return false
    },
  },

  watch: {
    newBillingAddress(address) {
      if (!address) return

      this.billingAddress = address

      const { name, address1, address2, state, city, zip, country } = address

      this.formattedDefaultAddress = `
            ${name},
            ${address2 || ''} ${address1},
            ${state},
            ${city} ${zip},
            ${country}
          `
    },
  },

  created() {
    // Prefill form data for updating existing data
    if (this.card) {
      this.cardExpiry = `${this.card.expMonth} / ${this.card.expYear}` || ''

      // Set formatted card number of existing card
      const { brand, last4 } = this.card
      if (brand === 'American Express') {
        this.cardNumber = `••••  ••••   •••${last4.substring(
          0,
          1
        )}   ${last4.substring(1, last4.length)}`
      } else {
        this.cardNumber = `••••  ••••   ••••   ${last4}`
      }

      // Set default check state
      if (this.defaultCardId === this.card.id) this.setDefault = true

      // Set default address
      if (this.card.billing && !values(this.card.billing).every(isEmpty)) {
        this.billingAddress = this.card.billing

        const { name, address1, address2, state, city, zip, country } =
          this.card.billing

        this.formattedDefaultAddress = `
          ${name},
          ${address2 || ''} ${address1},
          ${state},
          ${city} ${zip},
          ${country}
        `
      }
    }

    // If there's no default card, force set default
    if (!this.defaultCardId && !this.cardsLength && this.type === 'new') {
      this.setDefault = true
    }
  },

  methods: {
    async updateCard() {
      try {
        this.isUpdating = true

        if (this.billingAddress) {
          const { name, address1, address2, city, state, zip, country } =
            this.billingAddress

          await this.$swell.account.updateCard(this.card.id, {
            billing: {
              name,
              address1,
              address2,
              city,
              state,
              zip,
              country,
            },
          })
        }

        if (this.setDefault) {
          // Set current card as default
          await this.$swell.account.update({
            billing: {
              accountCardId: this.card.id,
            },
          })
        }

        // Close panel and fetch updated data
        this.isUpdating = false
        this.$emit('click-close')
        this.$store.dispatch('initializeCustomer')
        this.$store.dispatch('showNotification', {
          message: this.$t('account.payments.popup.save.success'),
        })
        this.$emit('refresh')
      } catch (err) {
        this.$store.dispatch('showNotification', {
          message: this.$t('account.payments.popup.save.error'),
          type: 'error',
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
          cvc: this.cardCVC,
        })

        if (token) {
          const card = await this.$swell.account.createCard({ token })

          if (!card)
            throw new Error(this.$t('account.payments.popup.create.error'))

          if (this.billingAddress) {
            const { name, address1, address2, city, state, zip, country } =
              this.billingAddress

            await this.$swell.account.updateCard(card.id, {
              billing: {
                name,
                address1,
                address2,
                city,
                state,
                zip,
                country,
              },
            })
          }

          if (this.setDefault) {
            // Set current address as default
            await this.$swell.account.update({
              billing: {
                accountCardId: card.id,
              },
            })
          }

          // Close panel and fetch updated data
          this.isCreating = false
          this.$emit('click-close')
          this.$store.dispatch('initializeCustomer')
          this.$store.dispatch('showNotification', {
            message: this.$t('account.payments.popup.create.success'),
          })
          this.$emit('refresh')
        }
      } catch (err) {
        this.isCreating = false
        this.$store.dispatch('showNotification', {
          message: this.$t('account.payments.popup.create.error'),
          type: 'error',
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
              accountCardId: null,
            },
          })
        }

        this.isDeleting = false

        // Close panel and fetch updated data
        this.$emit('click-close')
        this.$store.dispatch('initializeCustomer')
        this.$store.dispatch('showNotification', {
          message: this.$t('account.payments.popup.delete.success'),
        })
        this.$emit('refresh')
      } catch (err) {
        this.$store.dispatch('showNotification', {
          message: this.$t('account.payments.popup.delete.error'),
          type: 'error',
        })
      }
    },

    async handleEnterKey() {
      switch (this.type) {
        case 'update':
          await this.updateCard()
          break
        case 'new':
          await this.createCard()
          break
        default:
      }
    },
  },

  validations: {
    cardNumber: { required, maxLength: maxLength(19) },
    cardExpiry: { required, validDate },
    cardCVC: {
      required,
      integer,
      minLength: minLength(3),
      maxLength: maxLength(4),
    },
  },
}
</script>
