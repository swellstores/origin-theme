<template>
  <div class="relative">
    <div>
      <input
        v-model="email"
        type="text"
        :class="{
          'border-primary-med bg-primary-lightest': theme === 'light',
          'border-primary-lightest bg-primary-darkest': theme === 'dark',
        }"
        class="outline-none h-12 w-full rounded border border-primary-med py-2 pl-4 pr-14 transition focus:shadow-outline"
        :placeholder="$t('emailSignup.placeholder')"
        @input="delayTouch($v.email)"
      />
      <button
        :class="{
          'bg-primary-darker text-primary-lightest hover:text-accent-default':
            theme === 'dark',
        }"
        class="btn-icon absolute top-1 right-1"
        type="button"
        :aria-label="$t('emailSignup.send')"
        @click="subscribe()"
      >
        <div v-if="status === 'COMPLETE'">
          <BaseIcon icon="uil:check" class="m-auto" />
        </div>
        <div v-if="status === 'ERROR'">
          <BaseIcon icon="uil:exclamation-triangle" class="m-auto" />
        </div>
        <div v-if="status === 'READY'">
          <BaseIcon icon="uil:angle-right" class="m-auto" />
        </div>
        <div
          v-if="status === 'PENDING'"
          class="spinner center-xy h-5 w-5 bg-primary-dark"
        />
      </button>
    </div>
    <!-- Validation error -->
    <transition name="fade">
      <div
        v-show="errorMessage"
        class="absolute mt-1 w-full rounded bg-error-faded px-3 py-1 text-sm text-error-default"
      >
        {{ errorMessage }}
      </div>
    </transition>
  </div>
</template>

<script>
// Helpers
import get from 'lodash/get';
import { validationMixin } from 'vuelidate';
import { required, email } from 'vuelidate/lib/validators';

// For validation delay method
const touchMap = new WeakMap();

export default {
  mixins: [validationMixin],

  props: {
    theme: {
      type: String,
      default: 'light',
    },
  },

  data() {
    return {
      email: '',
      status: 'READY',
      errors: [],
    };
  },

  validations: {
    email: {
      required,
      email,
    },
  },

  computed: {
    errorMessage() {
      if (this.status === 'READY' && this.$v.email.$error) {
        return this.$t('emailSignup.email.error');
      } else if (this.errors.length) {
        return get(this, 'errors[0].message');
      }

      return '';
    },
  },

  methods: {
    async subscribe() {
      // Check input is valid
      if (this.$v.$invalid === false) {
        this.status = 'PENDING';

        try {
          const { errors } = await this.$swell.cart.update({
            account: {
              email: this.email,
              emailOptin: true,
            },
          });

          if (errors) {
            this.status = 'ERROR';
            this.errors = errors;
          } else {
            this.status = 'COMPLETE';
            this.errors = [];
            this.email = this.$t('emailSignup.success');
          }
        } catch (err) {
          if (this.isDev) {
            console.log(err);
          } else {
            this.$sentry?.captureException(err);
          }
          this.status = 'ERROR';
          this.errors = [err];
        }
      }
    },
    // Delay validation until 1s after last input
    delayTouch($v) {
      $v.$reset();
      if (touchMap.has($v)) {
        clearTimeout(touchMap.get($v));
      }
      touchMap.set($v, setTimeout($v.$touch, 1000));
    },
  },
};
</script>
