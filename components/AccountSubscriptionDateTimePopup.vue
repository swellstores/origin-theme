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
        class="panel h-vh-gap md:center-xy absolute bottom-0 w-full overflow-scroll rounded-t bg-primary-lighter py-6 md:relative md:h-auto md:max-h-80vh md:w-128 md:rounded"
      >
        <div class="container h-full">
          <h3 class="pb-2">
            {{ $t('account.subscriptions.id.popup.chooseDate.title') }}
          </h3>
          <p class="pb-6">
            {{ $t('account.subscriptions.id.popup.chooseDate.message') }}
          </p>

          <!-- Options -->
          <label class="label-xs-bold-faded mb-2 block">{{
            $t('account.subscriptions.id.popup.chooseDate.date.label')
          }}</label>
          <div class="mb-6">
            <div class="relative mb-2">
              <input
                v-model="date"
                :min="minDate"
                type="date"
                class="w-full rounded border border-primary-med bg-primary-lightest px-4 py-3 transition duration-200 ease-in-out"
              />
              <div class="center-y pointer-events-none absolute right-4">
                <BaseIcon icon="uil:calender" />
              </div>
            </div>

            <template v-if="$v.date.$dirty">
              <span
                v-if="!$v.date.required"
                class="label-sm mt-2 text-error-default"
                >{{
                  $t('account.subscriptions.id.popup.chooseDate.date.required')
                }}</span
              >

              <span
                v-else-if="!$v.date.validDate"
                class="label-sm mt-2 text-error-default"
                >{{
                  $t('account.subscriptions.id.popup.chooseDate.date.valid')
                }}</span
              >
            </template>
          </div>

          <label class="label-xs-bold-faded mb-2 block">{{
            $t('account.subscriptions.id.popup.chooseDate.time.label')
          }}</label>
          <div class="mb-6">
            <div class="relative mb-2">
              <input
                v-model="time"
                type="time"
                class="w-full rounded border border-primary-med bg-primary-lightest px-4 py-3 transition duration-200 ease-in-out"
              />
              <div class="center-y pointer-events-none absolute right-4">
                <BaseIcon icon="uil:clock" />
              </div>
            </div>

            <template v-if="$v.date.$dirty">
              <span
                v-if="!$v.time.required"
                class="label-sm mt-2 text-error-default"
                >{{
                  $t('account.subscriptions.id.popup.chooseDate.time.required')
                }}</span
              >

              <span
                v-else-if="!$v.time.validDateTime"
                class="label-sm mt-2 text-error-default"
                >{{
                  $t('account.subscriptions.id.popup.chooseDate.time.valid')
                }}</span
              >
            </template>
          </div>
        </div>

        <!-- Duplicate button elements to match fixed content below -->
        <div class="pointer-events-none invisible pb-4">
          <BaseButton class="mt-4" label="|" />
          <BaseButton class="mt-4" label="|" />
        </div>

        <!-- Action buttons -->
        <div
          class="container fixed left-0 bottom-0 w-full bg-primary-lighter pb-4"
        >
          <BaseButton
            class="mt-4"
            appearance="dark"
            :label="$t('account.subscriptions.id.popup.chooseDate.yes')"
            :loading-label="
              $t('account.subscriptions.id.popup.chooseDate.loading')
            "
            :is-loading="isLoading"
            @click.native="resumeOnDate"
          />

          <BaseButton
            class="mt-4"
            appearance="light"
            :label="$t('account.subscriptions.id.popup.chooseDate.no')"
            @click.native="$emit('click-close')"
          />
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
// Helpers
import { validationMixin } from 'vuelidate'
import { required } from 'vuelidate/lib/validators'

// Custom validation
const validDate = (value) => {
  // check if date is today or in the future
  const date = new Date(value)
  return new Date(date.toDateString()) >= new Date(new Date().toDateString())
}

const validDateTime = (param) => (value) => {
  // check if date and time is in the future
  const date = new Date(param)
  const selectedDateTime = new Date(`${param} ${value}`)
  return new Date(date.toDateString()) > new Date(new Date().toDateString())
    ? true
    : selectedDateTime > new Date()
}

export default {
  mixins: [validationMixin],

  props: {
    isLoading: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      date: null,
      time: '12:00',
    }
  },

  computed: {
    minDate() {
      return new Date().toISOString().split('T')[0]
    },
  },

  methods: {
    resumeOnDate() {
      this.$v.$touch() // Validate fields
      if (this.$v.$invalid) return
      const dateAndTime = new Date(`${this.date} ${this.time}`)
      this.$emit('resume-subscription', dateAndTime)
    },
  },

  validations() {
    const { date } = this
    return {
      date: { required, validDate },
      time: { required, validDateTime: validDateTime(date) },
    }
  },
}
</script>

<style>
input[type='date']::-webkit-inner-spin-button,
input[type='time']::-webkit-inner-spin-button {
  display: none;
}

input[type='date']::-webkit-calendar-picker-indicator,
input[type='time']::-webkit-calendar-picker-indicator {
  opacity: 0;
  cursor: pointer;
}
</style>
