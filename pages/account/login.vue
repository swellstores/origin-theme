<template>
  <div
    class="container relative pt-6 pb-24 md:max-w-112 md:pt-24"
    @keyup.enter="login"
  >
    <h2 class="pb-6">{{ $t('account.login.title') }}</h2>

    <div class="mb-6">
      <InputText
        v-model="email"
        class="mb-2"
        :label="$t('account.login.email.label')"
        :placeholder="$t('account.login.email.placeholder')"
        name="email"
        autocomplete="email"
      />

      <template v-if="$v.email.$dirty">
        <span v-if="!$v.email.email" class="label-sm text-error-default">{{
          $t('account.login.email.format')
        }}</span>

        <span
          v-else-if="!$v.email.required"
          class="label-sm text-error-default"
          >{{ $t('account.login.email.required') }}</span
        >
      </template>
    </div>

    <div class="mb-6">
      <InputText
        v-model="password"
        class="mb-2"
        :label="$t('account.login.password.label')"
        type="password"
        :placeholder="$t('account.login.password.placeholder')"
        name="currentPassword"
        autocomplete="current-password"
      />

      <template v-if="$v.password.$dirty">
        <span
          v-if="!$v.password.required"
          class="label-sm text-error-default"
          >{{ $t('account.login.password.required') }}</span
        >
      </template>
    </div>

    <NuxtLink
      class="text-xs font-semibold leading-tight text-primary-dark"
      :to="localePath('/account/forgot-password/')"
    >
      {{ $t('account.login.forgotPassword') }}
    </NuxtLink>

    <BaseButton
      class="mt-6 mb-4"
      appearance="dark"
      :label="$t('account.login.button.label')"
      :loading-label="$t('account.login.button.loadingLabel')"
      :is-loading="isProcessing"
      @click.native="login()"
    />

    <BaseButton
      class="mt-6 mb-4"
      appearance="light"
      :label="$t('account.login.createAccount')"
      :link="{
        url: localePath('/account/create-account/'),
        title: 'Create Account',
      }"
    />
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
      password: '',
      isProcessing: false,
    }
  },

  head() {
    return { title: 'Login' }
  },

  activated() {
    this.$v.$reset()
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
          throw new Error('Error')
        }

        this.$store.dispatch('showNotification', {
          message: this.$t('account.login.success'),
        })
        this.$router.push(this.localePath('/account/orders/'))
      } catch (err) {
        this.$store.dispatch('showNotification', {
          message: this.$t('account.login.error'),
          type: 'error',
        })
      }
    },
  },

  validations: {
    email: { required, email },
    password: { required },
  },
}
</script>
