<template>
  <div class="relative container md:max-w-112 md:pt-24" v-enter-key="login">
    <h2 class="pb-6">Log in</h2>

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
        placeholder="Your password"
        name="currentPassword"
        autocomplete="current-password"
        v-model="password"
      />

      <template v-if="$v.password.$dirty">
        <span class="label-sm text-error" v-if="!$v.password.required"
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
      email: '',
      password: '',
      isProcessing: false
    }
  },

  methods: {
    async login() {
      try {
        this.$v.$touch()
        if (this.$v.$invalid) return

        this.isProcessing = true

        const { email, password } = this

        const res = await this.$swell.account.login(email, password)

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
    email: { required, email },
    password: { required }
  }
}
</script>
