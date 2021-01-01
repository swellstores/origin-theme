<template>
  <div class="relative container md:max-w-112 md:pt-24" v-enter-key="login">
    <h2 class="pb-6">Login</h2>

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
        placeholder="Your password"
        name="currentPassword"
        autocomplete="current-password"
        v-model="customerPassword"
      />

      <template v-if="$v.customerPassword.$dirty">
        <span class="label-sm text-error" v-if="!$v.customerPassword.required"
          >Please enter your password.</span
        >
      </template>
    </div>

    <NuxtLink
      class="text-xs font-semibold leading-tight text-primary-dark"
      to="/account/forgot-password/"
    >
      Did you forget your password?
    </NuxtLink>

    <ButtonLoading
      class="dark w-full mt-6 mb-4"
      @click.native="login()"
      label="Log in"
      loadingLabel="Logging in"
      :isLoading="isProcessing"
    />

    <NuxtLink class="btn light w-full" to="/account/create-account/">
      Create account
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
    async login() {
      try {
        this.$v.$touch()
        if (this.$v.$invalid) return

        this.isProcessing = true

        const res = await this.$swell.account.login(this.customerEmail, this.customerPassword)
        console.log(res)
        this.isProcessing = false

        if (!res || res === null) {
          throw Error('Error')
        }

        this.$store.dispatch('showNotification', { message: 'You’ve succesfully logged in.' })
        this.$router.push('/account/orders/')
      } catch (err) {
        this.$store.dispatch('showNotification', {
          message: 'Your email or password was entered incorrectly.',
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
