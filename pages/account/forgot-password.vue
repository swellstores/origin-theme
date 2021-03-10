<template>
  <div v-enter-key="sendPasswordReset" class="relative container pt-6 pb-24 md:max-w-112 md:pt-24">
    <h2 class="pb-6">Forgot your password?</h2>

    <p class="text-sm mb-10">
      Enter your email address and we’ll send you an email on how to reset your password.
    </p>

    <div class="mb-6">
      <InputText
        v-model="email"
        class="mb-2"
        label="Email"
        placeholder="Your email address"
        name="email"
        autocomplete="email"
      />

      <template v-if="$v.email.$dirty">
        <span v-if="!$v.email.email" class="label-sm text-error"
          >Please enter a valid email address.</span
        >

        <span v-else-if="!$v.email.required" class="label-sm text-error"
          >Please enter your email address.</span
        >
      </template>
    </div>

    <ButtonLoading
      class="dark w-full mt-6 mb-4"
      label="Send Email"
      loading-label="Processing"
      :is-loading="isProcessing"
      @click.native="sendPasswordReset()"
    />

    <NuxtLink class="btn light w-full" to="/account/login/">
      Back to log in
    </NuxtLink>
  </div>
</template>

<script>
import { validationMixin } from 'vuelidate'
import { required, email } from 'vuelidate/lib/validators'

export default {
  mixins: [validationMixin],

  data() {
    return {
      email: '',
      isProcessing: false
    }
  },

  activated() {
    this.$v.$reset()
  },

  methods: {
    async sendPasswordReset() {
      try {
        this.$v.$touch()
        if (this.$v.$invalid) return

        this.isProcessing = true

        const res = await this.$swell.account.recover({
          email: this.email,
          reset_url: `${window.location.origin}/account/reset-password/?key={key}`
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

  validations: {
    email: { required, email }
  }
}
</script>
