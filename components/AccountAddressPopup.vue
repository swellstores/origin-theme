<template>
  <transition name="popup" :duration="700" appear>
    <div class="z-40 fixed inset-0" @keyup.enter="handleEnterKey">
      <!-- Overlay -->
      <div
        class="overlay opacity-50 absolute w-full h-full bg-primary-darker"
        @click="$emit('click-close')"
      />

      <!-- Panel -->
      <div
        class="
          panel
          w-full
          h-vh-gap
          absolute
          bottom-0
          rounded-t
          bg-primary-lighter
          overflow-scroll
          md:w-128 md:h-auto md:max-h-80vh md:relative md:rounded md:center-xy
        "
      >
        <div class="container pt-2 pb-4 md:pb-0">
          <div class="flex py-4">
            <h3 v-if="type === 'new'">
              {{ $t('account.addresses.popup.new.title') }}
            </h3>
            <h3 v-else>
              {{ $t('account.addresses.popup.edit.title') }}
            </h3>
            <button class="ml-auto" @click.prevent="$emit('click-close')">
              <BaseIcon icon="uil:multiply" size="sm" />
            </button>
          </div>

          <!-- Fields -->
          <div class="pt-6 pb-4">
            <div class="mb-6">
              <InputText
                v-model="firstName"
                class="mb-2"
                :label="$t('account.addresses.popup.firstName.label')"
                name="fname"
                autocomplete="given-name"
              />
              <template v-if="$v.firstName.$dirty">
                <span
                  v-if="!$v.firstName.required"
                  class="label-sm text-error-default"
                  >{{ $t('account.addresses.popup.firstName.required') }}</span
                >

                <span
                  v-if="!$v.firstName.maxLength"
                  class="label-sm text-error-default"
                  >{{
                    $t('account.addresses.popup.firstName.maxLength', { n: 40 })
                  }}</span
                >
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
                <span
                  v-if="!$v.lastName.required"
                  class="label-sm text-error-default"
                  >{{ $t('account.addresses.popup.lastName.required') }}</span
                >

                <span
                  v-if="!$v.lastName.maxLength"
                  class="label-sm text-error-default"
                  >{{
                    $t('account.addresses.popup.lastName.maxLength', { n: 40 })
                  }}</span
                >
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
                <span
                  v-if="!$v.address1.required"
                  class="label-sm text-error-default"
                  >{{ $t('account.addresses.popup.address1.required') }}</span
                >
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
                <span
                  v-if="!$v.city.required"
                  class="label-sm text-error-default"
                  >{{ $t('account.addresses.popup.city.required') }}</span
                >
              </template>
            </div>

            <div class="flex flex-no-wrap mb-6">
              <div class="w-1/2 mr-3">
                <label
                  class="label-xs-bold-faded block mb-2"
                  for="region-select"
                  >{{ $t('account.addresses.popup.region.label') }}</label
                >

                <div class="relative mb-2">
                  <region-select
                    id="region-select"
                    v-model="state"
                    class="
                      w-full
                      pl-4
                      pr-6
                      py-3
                      bg-primary-lightest
                      border border-primary-med
                      rounded
                      appearance-none
                      truncate
                    "
                    :country="country"
                    :region="state"
                    :disable-placeholder="true"
                    :usei18n="false"
                  />

                  <div>
                    <BaseIcon
                      icon="uil:angle-down"
                      class="absolute mr-2 right-0 center-y"
                    />
                  </div>
                </div>

                <template v-if="$v.state.$dirty">
                  <span
                    v-if="!$v.state.required"
                    class="label-sm text-error-default"
                    >{{ $t('account.addresses.popup.region.required') }}</span
                  >
                </template>
              </div>

              <div class="w-1/2 ml-3">
                <InputText
                  v-model="zip"
                  class="mb-2"
                  :label="$t('account.addresses.popup.zipCode.label')"
                  name="zipCode"
                  autocomplete="postal-code"
                />

                <template v-if="$v.zip.$dirty">
                  <span
                    v-if="!$v.zip.required"
                    class="label-sm text-error-default"
                    >{{ $t('account.addresses.popup.zipCode.required') }}</span
                  >
                </template>
              </div>
            </div>

            <div class="mb-6">
              <label
                class="label-xs-bold-faded block mb-2"
                for="country-select"
                >{{ $t('account.addresses.popup.country.label') }}</label
              >

              <div class="relative mb-2">
                <country-select
                  id="country-select"
                  v-model="country"
                  class="
                    w-full
                    px-4
                    py-3
                    bg-primary-lightest
                    border border-primary-med
                    rounded
                    appearance-none
                  "
                  :country="country"
                  :usei18n="false"
                  :autocomplete="true"
                />

                <BaseIcon
                  icon="uil:angle-down"
                  class="absolute mr-2 right-0 center-y"
                />
              </div>

              <template v-if="$v.state.$dirty">
                <span
                  v-if="!$v.country.required"
                  class="label-sm text-error-default"
                  >{{ $t('account.addresses.popup.country.required') }}</span
                >
              </template>
            </div>

            <div class="mb-6">
              <InputText
                v-model="phone"
                class="mb-2"
                :label="$t('account.addresses.popup.phone.label')"
                name="phone"
                autocomplete="tel"
              />
              <template v-if="$v.phone.$dirty">
                <span
                  v-if="!$v.phone.validPhone"
                  class="label-sm text-error-default"
                  >{{ $t('account.addresses.popup.phone.format') }}</span
                >
              </template>
            </div>

            <div v-if="flow === 'default' || defaultable" class="checkbox mb-6">
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

            <!-- Duplicate button elements to match fixed content below -->
            <div
              class="block md:hidden grid gap-y-4 invisible pointer-events-none"
            >
              <div v-if="type === 'new'" class="btn">|</div>
              <div v-if="type === 'update'" class="btn">|</div>
              <div v-if="type === 'update' && deletable" class="btn">|</div>
            </div>
          </div>
        </div>

        <!-- Action buttons -->
        <div
          class="
            w-full
            fixed
            container
            center-x
            bottom-0
            py-4
            bg-primary-lighter
            grid
            gap-y-4
            md:transform-none md:sticky md:left-0
          "
        >
          <BaseButton
            v-if="type === 'new'"
            appearance="dark"
            :label="$t('account.addresses.popup.create.button.label')"
            :loading-label="
              $t('account.addresses.popup.create.button.loadingLabel')
            "
            :is-loading="isCreating"
            :disabled="isUpdating || isDeleting"
            @click.native="create()"
          />

          <BaseButton
            v-if="type === 'update'"
            appearance="dark"
            :label="$t('account.addresses.popup.save.button.label')"
            :loading-label="
              $t('account.addresses.popup.save.button.loadingLabel')
            "
            :is-loading="isUpdating"
            :disabled="isCreating || isDeleting"
            @click.native="update()"
          />

          <BaseButton
            v-if="type === 'update' && deletable"
            appearance="light-error"
            :label="$t('account.addresses.popup.delete.button.label')"
            :loading-label="
              $t('account.addresses.popup.delete.button.loadingLabel')
            "
            :is-loading="isDeleting"
            :disabled="isCreating || isUpdating"
            @click.native="remove()"
          />
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
// Helpers
import { validationMixin } from 'vuelidate'
import { required, maxLength, helpers } from 'vuelidate/lib/validators'

// Phone number validation
const validPhone = helpers.regex(
  'validPhone',
  /^\s*(?:\+?(\d{1,3}))?([-. (]*(\d{3})[-. )]*)?((\d{3})[-. ]*(\d{2,4})(?:[-.x ]*(\d+))?)\s*$/
)

export default {
  components: {
    async CountrySelect() {
      const { CountrySelect } = await import('vue-country-region-select')
      return CountrySelect
    },
    async RegionSelect() {
      const { RegionSelect } = await import('vue-country-region-select')
      return RegionSelect
    },
  },

  mixins: [validationMixin],

  props: {
    address: {
      type: Object,
      default: null,
    },
    type: {
      type: String,
      default: 'update',
    },
    flow: {
      type: String,
      default: 'default',
    },
    defaultAddressId: {
      type: String,
      default: null,
    },
    addressesLength: {
      type: Number,
      default: 0,
    },
    deletable: {
      type: Boolean,
      default: false,
    },
    defaultable: {
      type: Boolean,
      default: false,
    },
    isCreating: {
      type: Boolean,
      default: false,
    },
    isUpdating: {
      type: Boolean,
      default: false,
    },
    isDeleting: {
      type: Boolean,
      default: false,
    },
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
      phone: '',
      setDefault: false,
    }
  },

  computed: {
    disableDefaultOption() {
      // Disable if no default address is set and no addresses exist
      if (!this.defaultAddressId && !this.addressesLength) return true
      // Disable if current address is the only one and default
      if (this.address) {
        if (
          this.defaultAddressId === this.address.id &&
          this.addressesLength === 1
        )
          return true
      }
      return false
    },

    addressBody() {
      const {
        firstName,
        lastName,
        address1,
        address2,
        city,
        state,
        zip,
        country,
        phone,
      } = this
      return {
        firstName,
        lastName,
        address1,
        address2,
        city,
        state,
        zip,
        country,
        phone,
      }
    },
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
      this.phone = this.address.phone || ''

      // Set default check state
      if (this.defaultAddressId === this.address.id) {
        this.setDefault = true
      }
    }

    // If there's no default card, force set default
    if (
      !this.defaultAddressId &&
      !this.addressesLength &&
      this.type === 'new'
    ) {
      this.setDefault = true
    }
  },

  methods: {
    create() {
      // Validate fields
      this.$v.$touch()
      if (this.$v.$invalid) return

      if (this.flow === 'payment') {
        this.$emit('new-billing-address', {
          ...this.addressBody,
          isDefault: this.setDefault,
        })
        return
      }

      this.$emit('new', { ...this.addressBody, isDefault: this.setDefault })
    },

    update() {
      this.$v.$touch()
      if (this.$v.$invalid) return

      this.$emit('update', { ...this.addressBody, isDefault: this.setDefault })
    },

    remove() {
      this.$emit('delete', this.address.id)
    },

    async handleEnterKey() {
      switch (this.type) {
        case 'update':
          await this.update()
          break
        case 'new':
          await this.create()
          break
        default:
      }
    },
  },

  validations: {
    firstName: { required, maxLength: maxLength(40) },
    lastName: { required, maxLength: maxLength(40) },
    address1: { required },
    city: { required },
    state: { required },
    zip: { required },
    country: { required },
    phone: { validPhone },
  },
}
</script>
