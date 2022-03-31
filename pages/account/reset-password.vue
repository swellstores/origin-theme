<template>
  <div
    class="container relative pt-6 pb-24 md:max-w-112 md:pt-24"
    @keyup.enter="changePassword"
  >
    <h2 class="pb-6">{{ $t('account.resetPassword.title') }}</h2>

    <p class="mb-10 text-sm">{{ $t('account.resetPassword.infoText') }}</p>

    <div class="mb-6">
      <InputText
        v-model="password"
        class="mb-2"
        :label="$t('account.resetPassword.password.label')"
        type="password"
        :hint="$t('account.resetPassword.password.hint', { n: 6 })"
        :placeholder="$t('account.resetPassword.password.placeholder')"
        name="newPassword"
        autocomplete="new-password"
      />

      <template v-if="$v.password.$dirty">
        <span
          v-if="!$v.password.minLength"
          class="label-sm text-error-default"
          >{{ $t('account.resetPassword.password.minLength', { n: 6 }) }}</span
        >

        <span
          v-if="!$v.password.required"
          class="label-sm text-error-default"
          >{{ $t('account.resetPassword.password.required') }}</span
        >
      </template>
    </div>

    <div class="mb-6">
      <InputText
        v-model="confirmPassword"
        class="mb-2"
        type="password"
        :placeholder="$t('account.resetPassword.confirmPassword.placeholder')"
      />

      <template v-if="$v.confirmPassword.$dirty">
        <span
          v-if="!$v.confirmPassword.sameAsPassword"
          class="label-sm text-error-default"
          >{{ $t('account.resetPassword.confirmPassword.notMatch') }}</span
        >
      </template>
    </div>

    <BaseButton
      appearance="dark"
      :label="$t('account.resetPassword.button.label')"
      :loading-label="$t('account.resetPassword.button.loadingLabel')"
      :is-loading="isProcessing"
      @click.native="changePassword()"
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
      isProcessing: false,
    }
  },

  head() {
    return { title: this.$t('account.resetPassword.title') }
  },

  created() {
    // Get password reset key query
    this.resetKey = this.$route.query.key

    // If no key is set, route to homepage.
    if (!this.resetKey) this.$router.push(this.localePath('/'))
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
          password,
        })

        this.isProcessing = false

        if (res.success) {
          this.$store.dispatch('showNotification', {
            message: this.$t('account.resetPassword.success'),
          })
          this.$router.push(this.localePath('/'))
        }
      } catch (err) {
        this.isProcessing = false

        this.$store.dispatch('showNotification', {
          message: this.$t('account.resetPassword.error'),
          type: 'error',
        })
      }
    },
  },

  validations: {
    password: { required, minLength: minLength(6) },
    confirmPassword: { required, sameAsPassword: sameAs('password') },
  },
}
</script>
