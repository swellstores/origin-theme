<template>
  <div class="relative container pt-6 pb-24 md:max-w-112 md:pt-24" v-enter-key="createAccount">
    <h2 class="pb-6">Create account</h2>

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
        label="Last Name"
        name="lastName"
        autocomplete="family-name"
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
        autocomplete="email"
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
        label="Password"
        type="password"
        hint="Must include a minimum of 6 characters."
        placeholder="Your password"
        name="newPassword"
        autocomplete="new-password"
        v-model="password"
      />

      <template v-if="$v.password.$dirty">
        <span class="label-sm text-error" v-if="!$v.password.minLength"
          >Your password needs to be at least six characters.</span
        >

        <span class="label-sm text-error" v-if="!$v.password.required"
          >Please enter your password.</span
        >
      </template>
    </div>

    <ButtonLoading
      class="dark w-full mt-6 mb-4"
      @click.native="createAccount()"
      label="Create account"
      loadingLabel="Creating"
      :isLoading="isProcessing"
    />

    <NuxtLink class="btn light w-full" to="/account/login/">
      Log in
    </NuxtLink>
  </div>
</template>

<script>
import { validationMixin } from 'vuelidate'
import { required, email, minLength, maxLength } from 'vuelidate/lib/validators'

export default {
  mixins: [validationMixin],

  data() {
    return {
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      isProcessing: false,
      errorMessage: ''
    }
  },

  methods: {
    async createAccount() {
      try {
        this.$v.$touch()
        if (this.$v.$invalid) return

        this.isProcessing = true

        const { email, firstName, lastName, password } = this

        const account = await this.$swell.account.create({
          email,
          firstName,
          lastName,
          password,
          emailOptin: true
        })

        this.isProcessing = false

        if (account.id) {
          this.isProcessing = false
          this.$store.commit('setState', { key: 'customerLoggedIn', value: true })
          this.$store.dispatch('showNotification', {
            message: 'You’ve succesfully created an account.'
          })
          this.$router.push('/account/orders/')
        } else {
          throw {
            account,
            error: new Error()
          }
        }
      } catch (err) {
        console.log(err.error)
        console.log(err.code)
        // Throw error if email already exists
        if (err.account) {
          if (err.account.email && err.account.email.code === 'UNIQUE') {
            this.$store.dispatch('showNotification', {
              message: 'An account already exists under this email address. Please log in.',
              type: 'error'
            })
          }
          // Throw auth error
        } else {
          this.$store.dispatch('showNotification', {
            message:
              err.message || 'There was an error creating your account. Please try again later.',
            type: 'error'
          })
        }
      }
    }
  },

  activated() {
    this.$v.$reset()
  },

  validations: {
    firstName: { required, maxLength: maxLength(40) },
    lastName: { required, maxLength: maxLength(40) },
    email: { required, email },
    password: { required, minLength: minLength(6) }
  }
}
</script>
