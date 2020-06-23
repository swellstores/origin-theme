<template>
  <div :class="[outerSpacingXClass, outerSpacingYClass]" class="relative overflow-hidden">
    <VisualMedia
      v-if="image"
      :source="image.url"
      :is-background="true"
      :use-parallax="{ enabled: useParallax, speed: -14, minW: 768 }"
    />
    <div
      :style="{ opacity: darkenBg / 100 }"
      class="absolute inset w-full h-full bg-primary-darkest"
    ></div>
    <div :class="innerSpacingClass" class="relative container">
      <div class="max-w-96 py-10 px-8 md:mx-4 md:px-12 md:py-14 bg-primary-lighter rounded">
        <h2 v-balance-text class="mb-3 text-3xl md:text-4xl lg:text-6xl">
          {{ heading }}
        </h2>
        <p v-balance-text>{{ description }}</p>
        <div class="relative mt-6">
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
        <div
          v-for="(error, index) in errors"
          :key="`subscribe-error-${index}`"
          class="error-message"
        >
          {{ error.message }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// Helpers
import { validationMixin } from 'vuelidate'
import { required, email } from 'vuelidate/lib/validators'

// For validation delay method
const touchMap = new WeakMap()

const innerSpacing = {
  none: 'py-6 sm:py-8',
  sm: 'py-12 md:py-14 lg:py-16',
  md: 'py-24 lg:py-28 xl:py-32',
  lg: 'py-32 lg:py-36 xl:py-40'
}

const outerSpacingX = {
  none: 'mx-0',
  sm: 'mx-2 lg:mx-4',
  md: 'mx-6 lg:mx-8',
  lg: 'mx-8 lg:mx-12 xl:mx-16'
}

const outerSpacingY = {
  none: 'my-0',
  sm: 'my-2 lg:my-4',
  md: 'my-6 lg:my-8',
  lg: 'my-8 lg:my-12 xl:my-16'
}

export default {
  name: 'SectionEmailSignup',
  mixins: [validationMixin],

  props: {
    heading: {
      type: String,
      default: ''
    },
    description: {
      type: String,
      default: ''
    },
    image: {
      type: [Object, String],
      default: () => ({})
    },
    darkenBg: {
      type: Number,
      default: 0
    },
    innerSpacing: {
      type: String,
      default: 'md'
    },
    outerSpacingX: {
      type: String,
      default: 'md'
    },
    outerSpacingY: {
      type: String,
      default: 'lg'
    },
    useParallax: {
      type: Boolean,
      default: false
    }
  },

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

  computed: {
    innerSpacingClass() {
      return innerSpacing[this.innerSpacing]
    },
    outerSpacingXClass() {
      return outerSpacingX[this.outerSpacingX]
    },
    outerSpacingYClass() {
      return outerSpacingY[this.outerSpacingY]
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
