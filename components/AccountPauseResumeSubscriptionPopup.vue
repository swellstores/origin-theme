<template>
  <transition name="popup" :duration="700" appear>
    <div class="z-40 fixed inset-0">
      <!-- Overlay -->
      <div
        class="overlay opacity-50 absolute w-full h-full bg-primary-darker"
        @click="$emit('click-close')"
      />

      <!-- Panel -->
      <div
        class="
          panel
          w-full
          md:w-128
          py-6
          h-auto
          md:max-h-80vh
          absolute
          md:relative
          bottom-0
          rounded-t
          md:rounded
          bg-primary-lighter
          overflow-scroll
          md:center-xy
        "
      >
        <div class="container">
          <!-- Title + message -->
          <div class="flex mb-5">
            <h3>
              {{
                paused
                  ? $t('account.subscriptions.id.popup.resume.title')
                  : $t('account.subscriptions.id.popup.pause.title')
              }}
            </h3>
            <button class="ml-auto" @click.prevent="$emit('click-close')">
              <BaseIcon icon="uil:multiply" size="sm" />
            </button>
          </div>
          <p class="pb-6">
            {{
              paused
                ? $t('account.subscriptions.id.popup.resume.message')
                : $t('account.subscriptions.id.popup.pause.message')
            }}
          </p>

          <!-- Options -->
          <div class="mb-10">
            <div class="flex items-center mb-2">
              <input
                id="now"
                v-model="interval"
                name="pause"
                type="radio"
                class="hidden"
                :value="'immediate'"
                checked
              />
              <label
                for="now"
                class="flex items-center label-sm cursor-pointer"
              >
                <span
                  class="
                    w-3
                    h-3
                    inline-block
                    mr-2
                    rounded-full
                    border border-primary-darkest
                    flex-no-shrink
                  "
                ></span>
                {{
                  paused
                    ? $t('account.subscriptions.id.popup.resume.resumeNow')
                    : $t('account.subscriptions.id.popup.pause.pauseNow')
                }}</label
              >
            </div>
            <div
              v-if="(!paused && cycleSkippable) || paused"
              class="flex items-center"
            >
              <input
                id="cycle-time"
                v-model="interval"
                name="pause"
                type="radio"
                class="hidden"
                :value="paused ? 'set' : 'skip-cycle'"
              />
              <label
                for="cycle-time"
                class="flex items-center label-sm cursor-pointer"
              >
                <span
                  class="
                    w-3
                    h-3
                    inline-block
                    mr-2
                    rounded-full
                    border border-primary-darkest
                    flex-no-shrink
                  "
                ></span>
                {{
                  paused
                    ? $t('account.subscriptions.id.popup.resume.chooseDate')
                    : $t('account.subscriptions.id.popup.pause.skipCycle')
                }}
              </label>
            </div>
          </div>

          <!-- Action buttons -->
          <div class="block md:flex">
            <BaseButton
              class="md:w-1/2 mb-4 md:ml-4 md:mb-0 md:order-2"
              appearance="dark"
              :label="confirmButtonLabel"
              :loading-label="
                paused
                  ? $t('account.subscriptions.id.popup.resume.loading')
                  : $t('account.subscriptions.id.popup.pause.loading')
              "
              :is-loading="isLoading"
              @click.native="accept()"
            />

            <BaseButton
              class="md:w-1/2 md:mb-0 md:order-1"
              appearance="light"
              :label="
                paused
                  ? $t('account.subscriptions.id.popup.resume.no')
                  : $t('account.subscriptions.id.popup.pause.no')
              "
              @click.native="$emit('click-close')"
            />
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  props: {
    status: {
      type: String,
      default: 'active',
    },
    cycleSkippable: {
      type: Boolean,
      default: false,
    },
    isLoading: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      interval: 'immediate',
      pickDateAndTimeisActive: false,
    }
  },

  computed: {
    paused() {
      return this.status === 'paused'
    },

    confirmButtonLabel() {
      return this.paused && this.interval === 'set'
        ? this.$t('account.subscriptions.id.popup.resume.continue')
        : this.paused
        ? this.$t('account.subscriptions.id.popup.resume.yes')
        : this.$t('account.subscriptions.id.popup.pause.yes')
    },
  },

  methods: {
    accept() {
      if (this.paused) {
        if (this.interval === 'set') {
          this.$emit('select-date-time')
          return
        }
        this.$emit('resume-subscription')
      } else {
        this.$emit('pause-subscription', this.interval)
      }
    },
  },
}
</script>

<style scoped>
input[type='radio']:checked + label {
  @apply font-semibold;
}

input[type='radio']:checked + label span {
  @apply bg-primary-darkest;
  box-shadow: 0px 0px 0px 2px var(--colors-primary-lighter) inset;
}
</style>
