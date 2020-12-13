<template>
  <transition name="editPanel" :duration="700" appear>
    <div class="z-40 fixed inset-0" v-enter-key.native="updateProfile">
      <!-- Overlay -->
      <div class="overlay" @click="$emit('click-close')"></div>

      <!-- Panel -->
      <div class="panel">
        <div class="container py-2">
          <div class="flex py-4">
            <h3>Edit profile</h3>
            <button class="ml-auto" @click.prevent="$emit('click-close')">
              <BaseIcon icon="uil:multiply" size="sm" />
            </button>
          </div>

          <!-- Fields -->
          <div class="pt-6">
            <div class="mb-6">
              <InputText
                class="mb-2"
                label="First Name"
                name="fname"
                autocomplete="given-name"
                v-model="firstName"
              />
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
              <InputText
                class="mb-2"
                label="First Name"
                name="surname"
                autocomplete="email"
                v-model="lastName"
              />
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
              <InputText
                class="mb-2"
                label="Email"
                placeholder="Your email address"
                name="email"
                autocomplete="given-name"
                v-model="email"
              />

              <template v-if="$v.email.$dirty">
                <span class="label-sm text-error" v-if="!$v.email.email"
                  >Please enter a valid email address.</span
                >

                <span class="label-sm text-error" v-else-if="!$v.email.required"
                  >Please enter your email address.</span
                >
              </template>
            </div>

            <div class="mb-6">
              <InputText
                class="mb-2"
                label="Change password"
                type="password"
                hint="Must include a minimum of 6 characters."
                placeholder="Enter your new password"
                name="new-password"
                autcomplete="new-password"
                v-model="password"
              />

              <template v-if="$v.password.$dirty">
                <span class="label-sm text-error" v-if="!$v.password.minLength"
                  >Your password needs to be at least six characters.</span
                >
              </template>
            </div>

            <div class="mb-6">
              <InputText
                class="mb-2"
                type="password"
                placeholder="Confirm new password"
                v-model="confirmPassword"
              />

              <template v-if="$v.confirmPassword.$dirty">
                <span class="label-sm text-error" v-if="!$v.confirmPassword.sameAsPassword"
                  >Passwords do not match.</span
                >
              </template>
            </div>

            <div class="checkbox mb-6">
              <input type="checkbox" id="set-default" v-model="optInEmail" />

              <label class="w-full" for="set-default">
                <p>Subscribe to newsletter</p>
                <div class="indicator ml-auto text-primary-lighter">
                  <BaseIcon icon="uil:check" size="sm" />
                </div>
              </label>
            </div>
          </div>

          <div class="w-full sticky left-0 bottom-0 bg-primary-lighter pb-4">
            <ButtonLoading
              class="w-full dark"
              @click.native="updateProfile()"
              label="Save changes"
              loadingLabel="Saving"
              :isLoading="isUpdating"
            />
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import { mapState } from 'vuex'
import { validationMixin } from 'vuelidate'
import { required, email, maxLength, minLength, sameAs } from 'vuelidate/lib/validators'

export default {
  mixins: [validationMixin],

  data() {
    return {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      optInEmail: false,
      isUpdating: false
    }
  },

  computed: {
    ...mapState(['customer'])
  },

  methods: {
    async updateProfile() {
      try {
        // Validate fields
        this.$v.$touch()
        if (this.$v.$invalid) return

        this.isUpdating = true

        const res = await this.$swell.account.update({
          email: this.email,
          first_name: this.firstName,
          last_name: this.lastName,
          email_optin: this.optInEmail,
          password: this.password
        })

        if (res) {
          // Re-initialize the customer to reflect updated data
          this.isUpdating = false
          this.$store.dispatch('initializeCustomer')
          this.$store.dispatch('showNotification', { message: 'Profile updated.' })
          this.$emit('click-close')
        }
      } catch (err) {
        this.$store.dispatch('showNotification', {
          message: 'There was an error updating your profile.',
          type: 'error'
        })
      }
    }
  },

  created() {
    // Prefill form data for updating existing data
    if (!this.customer) return

    this.firstName = this.customer.firstName
    this.lastName = this.customer.lastName
    this.email = this.customer.email
    this.optInEmail = this.customer.emailOptin
  },

  validations: {
    firstName: { required, maxLength: maxLength(40) },
    lastName: { required, maxLength: maxLength(40) },
    email: { required, email },
    password: { minLength: minLength(6) },
    confirmPassword: { sameAsPassword: sameAs('password') }
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
