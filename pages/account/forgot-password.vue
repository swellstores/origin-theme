<template>
  <div
    class="container relative pt-6 pb-24 md:max-w-112 md:pt-24"
    @keyup.enter="endPasswordReset"
  >
    <h2 class="pb-6">{{ $t('account.forgotPassword.title') }}</h2>

    <p class="mb-10 text-sm">
      {{ $t('account.forgotPassword.infoText') }}
    </p>

    <div class="mb-6">
      <InputText
        v-model="email"
        class="mb-2"
        :label="$t('account.forgotPassword.email.label')"
        :placeholder="$t('account.forgotPassword.email.placeholder')"
        name="email"
        autocomplete="email"
      />

      <template v-if="$v.email.$dirty">
        <span v-if="!$v.email.email" class="label-sm text-error-default">{{
          $t('account.forgotPassword.email.format')
        }}</span>

        <span
          v-else-if="!$v.email.required"
          class="label-sm text-error-default"
          >{{ $t('account.forgotPassword.email.required') }}</span
        >
      </template>
    </div>

    <BaseButton
      class="mt-6 mb-4"
      appearance="dark"
      :label="$t('account.forgotPassword.button.label')"
      :loading-label="$t('account.forgotPassword.button.loadingLabel')"
      :is-loading="isProcessing"
      @click.native="sendPasswordReset()"
    />

    <BaseButton
      appearance="light"
      :label="$t('account.forgotPassword.logIn')"
      :link="{ url: localePath('/account/login/'), title: 'Log in' }"
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
      isProcessing: false,
    }
  },

  head() {
    return { title: this.$t('account.forgotPassword.title') }
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
          reset_url: `${window.location.origin}/account/reset-password/?key={key}`,
        })

        this.isProcessing = false

        if (res.success) {
          this.flow = 'login'
          this.$store.dispatch('showNotification', {
            message: this.$t('account.forgotPassword.success'),
          })
        }
      } catch (err) {
        this.$store.dispatch('showNotification', {
          message: this.$t('account.forgotPassword.error'),
          type: 'error',
        })
      }
    },
  },

  validations: {
    email: { required, email },
  },
}
</script>
