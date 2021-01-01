<template>
  <div class="relative container md:max-w-112 md:pt-24" v-enter-key="createAccount">
    <h2 class="pb-6">Create account</h2>

    <div class="mb-6">
      <InputText
        class="mb-2"
        label="First Name"
        name="fname"
        autocomplete="given-name"
        v-model="customerFirstName"
      />
      <template v-if="$v.customerFirstName.$dirty">
        <span class="label-sm text-error" v-if="!$v.customerFirstName.required"
          >Please enter your first name.</span
        >

        <span class="label-sm text-error" v-if="!$v.customerFirstName.maxLength"
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
        v-model="customerLastName"
      />
      <template v-if="$v.customerLastName.$dirty">
        <span class="label-sm text-error" v-if="!$v.customerLastName.required"
          >Please enter your last name.</span
        >

        <span class="label-sm text-error" v-if="!$v.customerLastName.maxLength"
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
        v-model="customerEmail"
      />

      <template v-if="$v.customerEmail.$dirty">
        <span class="label-sm text-error" v-if="!$v.customerEmail.email"
          >Please enter a valid email address.</span
        >

        <span class="label-sm text-error" v-else-if="!$v.customerEmail.required"
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
        v-model="customerPassword"
      />

      <template v-if="$v.customerPassword.$dirty">
        <span class="label-sm text-error" v-if="!$v.customerPassword.minLength"
          >Your password needs to be at least six characters.</span
        >

        <span class="label-sm text-error" v-if="!$v.customerPassword.required"
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
      customerEmail: '',
      customerPassword: '',
      customerFirstName: '',
      customerLastName: '',
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

        const account = await this.$swell.account.create({
          email: this.customerEmail,
          first_name: this.customerFirstName,
          last_name: this.customerLastName,
          password: this.customerPassword,
          email_optin: true
        })

        this.isProcessing = false

        if (account.id) {
          this.isProcessing = false
          this.$store.commit('setState', { key: 'customerLoggedIn', value: true })
          this.$store.dispatch('showNotification', {
            message: 'You’ve succesfully created an account.'
          })
        } else {
          throw {
            account,
            error: new Error()
          }
        }
      } catch (err) {
        // Throw error if email already exists
        if (err.account) {
          if (err.account.email && err.account.email.code === 'UNIQUE') {
            this.$store.dispatch('showNotification', {
              message: 'An account already exists under this email address. Please log in.',
              type: 'error'
            })
          }
        } else {
          this.$store.dispatch('showNotification', {
            message: 'There was an error creating your account. Please try again later.',
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
    customerFirstName: { required, maxLength: maxLength(40) },
    customerLastName: { required, maxLength: maxLength(40) },
    customerEmail: { required, email },
    customerPassword: { required, minLength: minLength(6) }
  }
}
</script>
