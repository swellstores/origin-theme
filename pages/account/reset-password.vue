<template>
  <div class="relative container md:max-w-112 md:pt-24" v-enter-key="changePassword">
    <h2 class="pb-6">Change your password</h2>

    <p class="text-sm mb-10">Please enter your new password.</p>

    <div class="mb-6">
      <InputText
        class="mb-2"
        type="password"
        hint="Must include a minimum of 6 characters."
        placeholder="Enter your new password"
        name="new-password"
        autcomplete="new-password"
        v-model="password"
      />

      <template v-if="$v.password.$dirty">
        <span class="label-sm text-error" v-if="!$v.password.required"
          >Please enter your new password.</span
        >

        <span class="label-sm text-error" v-else-if="!$v.password.minLength"
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

    <ButtonLoading
      class="dark w-full"
      @click.native="changePassword()"
      label="Change password"
      loadingLabel="Processing…"
      :isLoading="isProcessing"
    />
  </div>
</template>

<script>
import { validationMixin } from 'vuelidate'
import { required, minLength, sameAs } from 'vuelidate/lib/validators'

export default {
  mixins: [validationMixin],

  data() {
    return {
      resetKey: null,
      password: null,
      confirmPassword: null,
      isProcessing: false
    }
  },
  methods: {
    async changePassword() {
      // Validate fields
      this.$v.$touch()
      if (this.$v.$invalid) return

      this.isProcessing = true

      try {
        const { resetKey, password } = this

        const res = await this.$swell.account.recover({
          resetKey,
          password
        })

        this.isProcessing = false

        if (res.success) {
          this.$store.dispatch('showNotification', {
            message: 'You’ve successfully updated your password.'
          })
          this.$router.push('/')
        }
      } catch (err) {
        this.isProcessing = false
        
        this.$store.dispatch('showNotification', {
          message:
            'There was an error updating your password. The reset password key may have expired.',
          type: 'error'
        })
      }
    }
  },

  created() {
    // Get password reset key query
    this.resetKey = this.$route.query['key']

    // If no key is set, route to homepage.
    if (!this.resetKey) this.$router.push('/')
  },

  validations: {
    password: { required, minLength: minLength(6) },
    confirmPassword: { required, sameAsPassword: sameAs('password') }
  }
}
</script>
