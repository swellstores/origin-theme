<template>
  <transition name="popup" :duration="700" appear>
    <div class="z-40 fixed inset-0" @keyup.enter="updateProfile">
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
            <h3>{{ $t('account.edit') }}</h3>
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
                :label="$t('account.popup.firstName.label')"
                name="fname"
                autocomplete="given-name"
              />
              <template v-if="$v.firstName.$dirty">
                <span
                  v-if="!$v.firstName.required"
                  class="label-sm text-error-default"
                  >{{ $t('account.popup.firstName.required') }}</span
                >

                <span
                  v-if="!$v.firstName.maxLength"
                  class="label-sm text-error-default"
                  >{{
                    $t('account.popup.firstName.maxLength', { n: 40 })
                  }}</span
                >
              </template>
            </div>

            <div class="mb-6">
              <InputText
                v-model="lastName"
                class="mb-2"
                :label="$t('account.popup.lastName.label')"
                name="lastName"
                autocomplete="family-name"
              />
              <template v-if="$v.lastName.$dirty">
                <span
                  v-if="!$v.lastName.required"
                  class="label-sm text-error-default"
                  >{{ $t('account.popup.lastName.required') }}</span
                >

                <span
                  v-if="!$v.lastName.maxLength"
                  class="label-sm text-error-default"
                  >{{ $t('account.popup.lastName.maxLength', { n: 40 }) }}</span
                >
              </template>
            </div>

            <div class="mb-6">
              <InputText
                v-model="email"
                class="mb-2"
                :label="$t('account.popup.email.label')"
                :placeholder="$t('account.popup.email.placeholder')"
                name="email"
                autocomplete="email"
              />

              <template v-if="$v.email.$dirty">
                <span
                  v-if="!$v.email.email"
                  class="label-sm text-error-default"
                  >{{ $t('account.popup.email.format') }}</span
                >

                <span
                  v-else-if="!$v.email.required"
                  class="label-sm text-error-default"
                  >{{ $t('account.popup.email.required') }}</span
                >
              </template>
            </div>

            <div class="mb-6">
              <InputText
                v-model="password"
                class="mb-2"
                :label="$t('account.popup.password.label')"
                type="password"
                :hint="$t('account.popup.password.hint', { n: 6 })"
                :placeholder="$t('account.popup.password.placeholder')"
                name="newPassword"
                autocomplete="new-password"
              />

              <template v-if="$v.password.$dirty">
                <span
                  v-if="!$v.password.minLength"
                  class="label-sm text-error-default"
                  >{{ $t('account.popup.password.minLength', { n: 6 }) }}</span
                >

                <span
                  v-if="!$v.password.required"
                  class="label-sm text-error-default"
                  >{{ $t('account.popup.password.required') }}</span
                >
              </template>
            </div>

            <div class="mb-6">
              <InputText
                v-model="confirmPassword"
                class="mb-2"
                type="password"
                :placeholder="$t('account.popup.confirmPassword.placeholder')"
              />

              <template v-if="$v.confirmPassword.$dirty">
                <span
                  v-if="!$v.confirmPassword.sameAsPassword"
                  class="label-sm text-error-default"
                  >{{ $t('account.popup.confirmPassword.notMatch') }}</span
                >
              </template>
            </div>

            <div class="checkbox">
              <input id="set-default" v-model="emailOptin" type="checkbox" />

              <label class="w-full" for="set-default">
                <p>{{ $t('account.popup.subscribe.label') }}</p>
                <div class="indicator ml-auto text-primary-lighter">
                  <BaseIcon icon="uil:check" size="sm" />
                </div>
              </label>
            </div>

            <!-- Duplicate button elements to match fixed content below -->
            <div class="block md:hidden invisible pointer-events-none">
              <div class="btn">|</div>
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
            appearance="dark"
            :label="$t('account.popup.save.label')"
            :loading-label="$t('account.popup.save.loadingLabel')"
            :is-loading="isUpdating"
            @click.native="updateProfile()"
          />
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import { mapState } from 'vuex'
import { validationMixin } from 'vuelidate'
import {
  required,
  email,
  maxLength,
  minLength,
  sameAs,
} from 'vuelidate/lib/validators'

export default {
  mixins: [validationMixin],

  data() {
    return {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      emailOptin: false,
      isUpdating: false,
    }
  },

  computed: {
    ...mapState(['customer']),
  },

  created() {
    // Prefill form data for updating existing data
    if (!this.customer) return

    this.firstName = this.customer.firstName
    this.lastName = this.customer.lastName
    this.email = this.customer.email
    this.emailOptin = this.customer.emailOptin
  },

  methods: {
    async updateProfile() {
      try {
        // Validate fields
        this.$v.$touch()
        if (this.$v.$invalid) return

        this.isUpdating = true

        const { email, firstName, lastName, emailOptin, password } = this

        const res = await this.$swell.account.update({
          email,
          firstName,
          lastName,
          emailOptin,
          password,
        })

        if (res) {
          // Re-initialize the customer to reflect updated data
          this.isUpdating = false
          this.$store.dispatch('initializeCustomer')
          this.$store.dispatch('showNotification', {
            message: this.$t('account.popup.save.success'),
          })
          this.$emit('click-close')
        }
      } catch (err) {
        this.$store.dispatch('showNotification', {
          message: this.$t('account.popup.save.error'),
          type: 'error',
        })
      }
    },
  },

  validations: {
    firstName: { required, maxLength: maxLength(40) },
    lastName: { required, maxLength: maxLength(40) },
    email: { required, email },
    password: { minLength: minLength(6) },
    confirmPassword: { sameAsPassword: sameAs('password') },
  },
}
</script>
