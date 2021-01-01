<template>
  <div class="relative container md:max-w-112 md:pt-24" v-enter-key="sendPasswordReset">
    <h2 class="pb-6">Forgot your password?</h2>

    <p class="text-sm mb-10">
      Enter your email address and we’ll send you an email on how to reset your password.
    </p>

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

    <ButtonLoading
      class="dark w-full mt-6 mb-4"
      @click.native="sendPasswordReset()"
      label="Send Email"
      loadingLabel="Processing"
      :isLoading="isProcessing"
    />

    <NuxtLink class="btn light w-full" to="/account/login/">
      Back to Login
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
      isProcessing: false
    }
  },

  methods: {
    async sendPasswordReset() {
      try {
        this.$v.$touch()
        if (this.$v.$invalid) return

        this.isProcessing = true

        const res = await this.$swell.account.recover({
          email: this.customerEmail,
          reset_url: `http://localhost:3333/reset-password/?key={key}`
        })

        this.isProcessing = false

        if (res.success) {
          this.flow = 'login'
          this.$store.dispatch('showNotification', {
            message: 'An email has been sent to reset your password.'
          })
        }
      } catch (err) {
        this.$store.dispatch('showNotification', {
          message: 'There was an error resetting your password.',
          type: 'error'
        })
      }
    }
  },

  activated() {
    this.$v.$reset()
  },

  validations: {
    customerEmail: { required, email },
    customerPassword: { required }
  }
}
</script>
