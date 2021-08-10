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
          h-vh-gap
          absolute
          bottom-0
          rounded-t
          bg-primary-lighter
          overflow-scroll
          md:h-auto md:max-h-80vh md:relative md:rounded md:center-xy
        "
      >
        <div class="container h-full">
          <h3 class="pb-2">
            {{ $t('account.subscriptions.id.popup.chooseDate.title') }}
          </h3>
          <p class="pb-6">
            {{ $t('account.subscriptions.id.popup.chooseDate.message') }}
          </p>

          <!-- Options -->
          <label class="label-xs-bold-faded block mb-2">{{
            $t('account.subscriptions.id.popup.chooseDate.date.label')
          }}</label>
          <div class="mb-6">
            <div class="relative mb-2">
              <input
                v-model="date"
                :min="minDate"
                type="date"
                class="
                  w-full
                  px-4
                  py-3
                  bg-primary-lightest
                  border border-primary-med
                  rounded
                  transition
                  ease-in-out
                  duration-200
                "
              />
              <div class="absolute right-4 center-y pointer-events-none">
                <BaseIcon icon="uil:calender" />
              </div>
            </div>

            <template v-if="$v.date.$dirty">
              <span
                v-if="!$v.date.required"
                class="label-sm text-error-default mt-2"
                >{{
                  $t('account.subscriptions.id.popup.chooseDate.date.required')
                }}</span
              >

              <span
                v-else-if="!$v.date.validDate"
                class="label-sm text-error-default mt-2"
                >{{
                  $t('account.subscriptions.id.popup.chooseDate.date.valid')
                }}</span
              >
            </template>
          </div>

          <label class="label-xs-bold-faded block mb-2">{{
            $t('account.subscriptions.id.popup.chooseDate.time.label')
          }}</label>
          <div class="mb-6">
            <div class="relative mb-2">
              <input
                v-model="time"
                type="time"
                class="
                  w-full
                  px-4
                  py-3
                  bg-primary-lightest
                  border border-primary-med
                  rounded
                  transition
                  ease-in-out
                  duration-200
                "
              />
              <div class="absolute right-4 center-y pointer-events-none">
                <BaseIcon icon="uil:clock" />
              </div>
            </div>

            <template v-if="$v.date.$dirty">
              <span
                v-if="!$v.time.required"
                class="label-sm text-error-default mt-2"
                >{{
                  $t('account.subscriptions.id.popup.chooseDate.time.required')
                }}</span
              >

              <span
                v-else-if="!$v.time.validDateTime"
                class="label-sm text-error-default mt-2"
                >{{
                  $t('account.subscriptions.id.popup.chooseDate.time.valid')
                }}</span
              >
            </template>
          </div>
        </div>

        <!-- Duplicate button elements to match fixed content below -->
        <div class="invisible pointer-events-none pb-4">
          <BaseButton class="mt-4" label="|" />
          <BaseButton class="mt-4" label="|" />
        </div>

        <!-- Action buttons -->
        <div
          class="w-full container fixed left-0 bottom-0 bg-primary-lighter pb-4"
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
