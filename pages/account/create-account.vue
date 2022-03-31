<template>
  <div
    class="container relative pt-6 pb-24 md:max-w-112 md:pt-24"
    @keyup.enter="createAccount"
  >
    <h2 class="pb-6">{{ $t('account.createAccount.title') }}</h2>

    <div class="mb-6">
      <InputText
        v-model="firstName"
        class="mb-2"
        :label="$t('account.createAccount.firstName.label')"
        name="fname"
        autocomplete="given-name"
      />
      <template v-if="$v.firstName.$dirty">
        <span
          v-if="!$v.firstName.required"
          class="label-sm text-error-default"
          >{{ $t('account.createAccount.firstName.required') }}</span
        >

        <span
          v-if="!$v.firstName.maxLength"
          class="label-sm text-error-default"
          >{{
            $t('account.createAccount.firstName.maxLength', { n: 40 })
          }}</span
        >
      </template>
    </div>

    <div class="mb-6">
      <InputText
        v-model="lastName"
        class="mb-2"
        :label="$t('account.createAccount.lastName.label')"
        name="lastName"
        autocomplete="family-name"
      />
      <template v-if="$v.lastName.$dirty">
        <span
          v-if="!$v.lastName.required"
          class="label-sm text-error-default"
          >{{ $t('account.createAccount.lastName.required') }}</span
        >

        <span
          v-if="!$v.lastName.maxLength"
          class="label-sm text-error-default"
          >{{ $t('account.createAccount.lastName.maxLength', { n: 40 }) }}</span
        >
      </template>
    </div>

    <div class="mb-6">
      <InputText
        v-model="email"
        class="mb-2"
        :label="$t('account.createAccount.email.label')"
        :placeholder="$t('account.createAccount.email.placeholder')"
        name="email"
        autocomplete="email"
      />

      <template v-if="$v.email.$dirty">
        <span v-if="!$v.email.email" class="label-sm text-error-default">{{
          $t('account.createAccount.email.format')
        }}</span>

        <span
          v-else-if="!$v.email.required"
          class="label-sm text-error-default"
          >{{ $t('account.createAccount.email.required') }}</span
        >
      </template>
    </div>

    <div class="mb-6">
      <InputText
        v-model="password"
        class="mb-2"
        :label="$t('account.createAccount.password.label')"
        type="password"
        :hint="$t('account.createAccount.password.hint', { n: 6 })"
        :placeholder="$t('account.createAccount.password.placeholder')"
        name="newPassword"
        autocomplete="new-password"
      />

      <template v-if="$v.password.$dirty">
        <span
          v-if="!$v.password.minLength"
          class="label-sm text-error-default"
          >{{ $t('account.createAccount.password.minLength', { n: 6 }) }}</span
        >

        <span
          v-if="!$v.password.required"
          class="label-sm text-error-default"
          >{{ $t('account.createAccount.password.required') }}</span
        >
      </template>
    </div>

    <BaseButton
      class="mt-6 mb-4"
      appearance="dark"
      :label="$t('account.createAccount.button.label')"
      :loading-label="$t('account.createAccount.button.loadingLabel')"
      :is-loading="isProcessing"
      @click.native="createAccount()"
    />

    <BaseButton
      appearance="light"
      :label="$t('account.createAccount.logIn')"
      :link="localePath('/account/login')"
    />
  </div>
</template>

<script>
// Helpers
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
      errorMessage: '',
    }
  },

  head() {
    return {
      title: this.$t('account.createAccount.title'),
    }
  },

  activated() {
    this.$v.$reset()
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
          emailOptin: true,
        })

        this.isProcessing = false

        if (account.id) {
          this.isProcessing = false
          this.$store.commit('setState', {
            key: 'customerLoggedIn',
            value: true,
          })
          this.$store.dispatch('showNotification', {
            message: this.$t('account.createAccount.success'),
          })
          this.$router.push(this.localePath('/account/orders/'))
        } else if (account.email && account.email.code === 'UNIQUE') {
          this.$store.dispatch('showNotification', {
            message: this.$t('account.createAccount.alreadyExists'),
            type: 'error',
          })
        }
      } catch (err) {
        this.$store.dispatch('showNotification', {
          message: err.message || this.$t('account.createAccount.error'),
          type: 'error',
        })
      }
    },
  },

  validations: {
    firstName: { required, maxLength: maxLength(40) },
    lastName: { required, maxLength: maxLength(40) },
    email: { required, email },
    password: { required, minLength: minLength(6) },
  },
}
</script>
