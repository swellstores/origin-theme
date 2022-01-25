<template>
  <transition name="popup" :duration="700" appear>
    <div class="fixed inset-0 z-40">
      <!-- Overlay -->
      <div
        class="overlay absolute h-full w-full bg-primary-darker opacity-50"
        @click="$emit('click-close')"
      />

      <!-- Panel -->
      <div
        class="panel md:center-xy absolute bottom-0 h-auto w-full overflow-scroll rounded-t bg-primary-lighter py-6 md:relative md:max-h-80vh md:w-128 md:rounded"
      >
        <div class="container">
          <!-- Title + message -->
          <div class="mb-5 flex">
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
            <div class="mb-2 flex items-center">
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
                class="label-sm flex cursor-pointer items-center"
              >
                <span
                  class="flex-no-shrink mr-2 inline-block h-3 w-3 rounded-full border border-primary-darkest"
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
                class="label-sm flex cursor-pointer items-center"
              >
                <span
                  class="flex-no-shrink mr-2 inline-block h-3 w-3 rounded-full border border-primary-darkest"
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
              class="mb-4 md:order-2 md:ml-4 md:mb-0 md:w-1/2"
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
              class="md:order-1 md:mb-0 md:w-1/2"
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
  box-shadow: 0 0 0 2px var(--colors-primary-lighter) inset;
  @apply bg-primary-darkest;
}
</style>
