<template>
  <transition name="popup" :duration="700" appear>
    <div v-enter-key="handleEnterKey" class="z-40 fixed inset-0">
      <!-- Overlay -->
      <div
        class="overlay opacity-50 absolute w-full h-full bg-primary-darker"
        @click="$emit('click-close')"
      ></div>

      <!-- Panel -->
      <div
        class="panel w-full md:w-128 h-vh-gap md:h-auto md:max-h-80vh absolute md:relative bottom-0 
        rounded-t md:rounded bg-primary-lighter overflow-scroll md:center-xy"
      >
        <div class="container py-2">
          <div class="flex py-4">
            <h3 v-if="type === 'new'">{{ $t('account.addresses.popup.new.title') }}</h3>
            <h3 v-else>{{ $t('account.addresses.popup.edit.title') }}</h3>
            <button class="ml-auto" @click.prevent="$emit('click-close')">
              <BaseIcon icon="uil:multiply" size="sm" />
            </button>
          </div>

          <!-- Fields -->
          <div class="pt-6">
            <div class="mb-6">
              <InputText
                v-model="firstName"
                class="mb-2"
                :label="$t('account.addresses.popup.firstName.label')"
                name="fname"
                autocomplete="given-name"
              />
              <template v-if="$v.firstName.$dirty">
                <span v-if="!$v.firstName.required" class="label-sm text-error">{{
                  $t('account.addresses.popup.firstName.required')
                }}</span>

                <span v-if="!$v.firstName.maxLength" class="label-sm text-error">{{
                  $t('account.addresses.popup.firstName.maxLength', { n: 40 })
                }}</span>
              </template>
            </div>

            <div class="mb-6">
              <InputText
                v-model="lastName"
                class="mb-2"
                :label="$t('account.addresses.popup.lastName.label')"
                name="surname"
                autocmplete="family-name"
              />
              <template v-if="$v.lastName.$dirty">
                <span v-if="!$v.lastName.required" class="label-sm text-error">{{
                  $t('account.addresses.popup.lastName.required')
                }}</span>

                <span v-if="!$v.lastName.maxLength" class="label-sm text-error">{{
                  $t('account.addresses.popup.lastName.maxLength', { n: 40 })
                }}</span>
              </template>
            </div>

            <div class="mb-6">
              <InputText
                v-model="address1"
                class="mb-2"
                :label="$t('account.addresses.popup.address1.label')"
                name="address1"
                autocomplete="address-line1"
              />
              <template v-if="$v.address1.$dirty">
                <span v-if="!$v.address1.required" class="label-sm text-error">{{
                  $t('account.addresses.popup.address1.required')
                }}</span>
              </template>
            </div>

            <InputText
              v-model="address2"
              class="mb-6"
              :label="$t('account.addresses.popup.address2.label')"
              name="address2"
              autocomplete="address-line2"
            />

            <div class="mb-6">
              <InputText
                v-model="city"
                class="mb-2"
                :label="$t('account.addresses.popup.city.label')"
                name="city"
                autocomplete="address-level2"
              />
              <template v-if="$v.city.$dirty">
                <span v-if="!$v.city.required" class="label-sm text-error">{{
                  $t('account.addresses.popup.city.required')
                }}</span>
              </template>
            </div>

            <div class="flex flex-no-wrap mb-6">
              <div class="w-1/2 mr-3">
                <label class="label-xs-bold-faded block mb-2" for="region-select">{{
                  $t('account.addresses.popup.region.label')
                }}</label>

                <div class="relative mb-2">
                  <region-select
                    id="region-select"
                    v-model="state"
                    class="w-full pl-4 pr-6 py-3 bg-primary-lightest border border-primary-med rounded appearance-none truncate"
                    :country="country"
                    :region="state"
                    :disable-placeholder="true"
                  />

                  <div>
                    <BaseIcon icon="uil:angle-down" class="absolute mr-2 right-0 center-y" />
                  </div>
                </div>

                <template v-if="$v.state.$dirty">
                  <span v-if="!$v.state.required" class="label-sm text-error">{{
                    $t('account.addresses.popup.region.required')
                  }}</span>
                </template>
              </div>

              <div class="w-1/2 ml-3">
                <InputText
                  v-model="zip"
                  class="mb-2"
                  :label="$t('account.addresses.popup.zipCode.required')"
                  name="zipCode"
                  autocomplete="postal-code"
                />

                <template v-if="$v.zip.$dirty">
                  <span v-if="!$v.zip.required" class="label-sm text-error">{{
                    $t('account.addresses.popup.zipCode.required')
                  }}</span>
                </template>
              </div>
            </div>

            <div class="mb-6">
              <label class="label-xs-bold-faded block mb-2" for="country-select">{{
                $t('account.addresses.popup.country.label')
              }}</label>

              <div class="relative mb-2">
                <country-select
                  id="country-select"
                  v-model="country"
                  class="w-full px-4 py-3 bg-primary-lightest border border-primary-med rounded appearance-none"
                  :country="country"
                  :autocomplete="true"
                />

                <BaseIcon icon="uil:angle-down" class="absolute mr-2 right-0 center-y" />
              </div>

              <template v-if="$v.state.$dirty">
                <span v-if="!$v.country.required" class="label-sm text-error">{{
                  $t('account.addresses.popup.country.required')
                }}</span>
              </template>
            </div>

            <div v-if="flow === 'default'" class="checkbox mb-6">
              <input
                id="set-default"
                v-model="setDefault"
                type="checkbox"
                :disabled="disableDefaultOption"
              />

              <label class="w-full" for="set-default">
                <p>{{ $t('account.addresses.popup.setAsDefault') }}</p>
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
              :label="$t('account.addresses.popup.create.button.label')"
              :loading-label="$t('account.addresses.popup.create.button.loadingLabel')"
              :is-loading="isCreating"
              :disabled="isUpdating || isDeleting"
              @click.native="createAddress()"
            />

            <ButtonLoading
              v-if="type === 'update'"
              class="w-full dark my-4"
              :label="$t('account.addresses.popup.save.button.label')"
              :loading-label="$t('account.addresses.popup.save.button.loadingLabel')"
              :is-loading="isUpdating"
              :disabled="isCreating || isDeleting"
              @click.native="updateAddress()"
            />

            <ButtonLoading
              v-if="type === 'update'"
              class="w-full light-error"
              :label="$t('account.addresses.popup.delete.button.label')"
              :loading-label="$t('account.addresses.popup.delete.button.loadingLabel')"
              :is-loading="isDeleting"
              :disabled="isCreating || isUpdating"
              @click.native="deleteAddress()"
            />
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import { validationMixin } from 'vuelidate'
import { required, maxLength } from 'vuelidate/lib/validators'

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

  methods: {
    async updateAddress() {
      try {
        // Validate fields
        this.$v.$touch()
        if (this.$v.$invalid) return

        this.isUpdating = true

        await this.$swell.account.updateAddress(this.address.id, {
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
        } else if (this.defaultAddressId === this.address.id) {
          // If is default, unset it.
          // Set current address as default
          await this.$swell.account.update({
            shipping: {
              accountAddressId: null
            }
          })
        }

        // Close panel and fetch updated data
        this.isUpdating = true
        this.$emit('click-close')
        this.$store.dispatch('initializeCustomer')
        this.$store.dispatch('showNotification', {
          message: this.$t('account.addresses.popup.save.success')
        })
        this.$emit('refresh')
      } catch (err) {
        this.$store.dispatch('showNotification', {
          message: this.$t('account.addresses.popup.save.error'),
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

        const { firstName, lastName, address1, address2, city, state, zip, country } = this

        const address = await this.$swell.account.createAddress({
          name: `${firstName.trim()} ${lastName.trim()}`,
          address1,
          address2,
          city,
          state,
          zip,
          country
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
        this.$store.dispatch('showNotification', {
          message: this.$t('account.addresses.popup.create.success')
        })
        this.$emit('refresh')
      } catch (err) {
        this.$store.dispatch('showNotification', {
          message: this.$t('account.addresses.popup.create.error'),
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
        this.$store.dispatch('showNotification', {
          message: this.$t('account.addresses.popup.delete.success'),
          type: 'error'
        })
        this.$emit('refresh')
      } catch (err) {
        this.$store.dispatch('showNotification', {
          message: this.$t('account.addresses.popup.delete.error'),
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
      }
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
