<template>
  <div class="">
    <div class="relative">
      <input
        v-model="email"
        type="text"
        class="rounded w-full h-12 pl-4 pr-14 py-2 border border-primary-med bg-primary-lightest outline-none transition focus:shadow-outline"
        placeholder="Email address"
        @input="delayTouch($v.email)"
      />
      <button class="btn-icon absolute top-1 right-1" type="button" @click="subscribe()">
        <div v-if="status === 'COMPLETE'"><BaseIcon icon="uil:check" class="m-auto" /></div>
        <div v-if="status === 'ERROR'">
          <BaseIcon icon="uil:exclamation-triangle" class="m-auto" />
        </div>
        <div v-if="status === 'READY'"><BaseIcon icon="uil:angle-right" class="m-auto" /></div>
        <div v-if="status === 'PENDING'" class="spinner center-xy w-5 h-5 bg-primary-med"></div>
      </button>
    </div>
    <!-- Validation error -->
    <transition name="fade">
      <div v-show="$v.email.$error" class="error-message">
        That doesn't look like an email... 🤔
      </div>
    </transition>
    <!-- API errors -->
    <div v-for="(error, index) in errors" :key="`subscribe-error-${index}`" class="error-message">
      {{ error.message }}
    </div>
  </div>
</template>

<script>
// Helpers
import { validationMixin } from 'vuelidate'
import { required, email } from 'vuelidate/lib/validators'

// For validation delay method
const touchMap = new WeakMap()

export default {
  mixins: [validationMixin],

  data() {
    return {
      email: '',
      status: 'READY',
      errors: []
    }
  },

  validations: {
    email: {
      required,
      email
    }
  },

  methods: {
    async subscribe() {
      // Check input is valid
      if (this.$v.$invalid === false) {
        this.status = 'PENDING'

        try {
          const { errors } = await this.$swell.account.update({
            email: this.email,
            emailOptin: true
          })

          if (errors) {
            this.status = 'ERROR'
            this.errors = errors
          } else {
            this.status = 'COMPLETE'
            this.errors = []
            this.email = 'Done!'
          }
        } catch (err) {
          if (this.isDev) {
            console.log(err)
          } else {
            this.$sentry.captureException(err)
          }
          this.status = 'ERROR'
          this.errors = [err]
        }
      }
    },
    // Delay validation until 1s after last input
    delayTouch($v) {
      $v.$reset()
      if (touchMap.has($v)) {
        clearTimeout(touchMap.get($v))
      }
      touchMap.set($v, setTimeout($v.$touch, 1000))
    }
  }
}
</script>

<style lang="postcss">
.error-message {
  @apply mt-1 px-3 py-1 bg-error-faded text-error text-sm rounded;
}
</style>
