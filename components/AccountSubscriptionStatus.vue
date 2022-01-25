<template>
  <!-- Active -->
  <div class="flex">
    <div
      class="relative mr-2 h-6 w-6 flex-shrink-0 rounded-full bg-ok-default"
      :class="{
        'bg-ok-default': status === 'active',
        'bg-primary-dark': status === 'canceled',
        'bg-warning-default': ['trial', 'paused'].includes(status),
      }"
    >
      <BaseIcon
        class="center-xy absolute text-primary-lightest"
        :icon="`uil:${icon}`"
        size="w-4 h-4"
      />
    </div>
    <div>
      <p>
        {{ statusTitle }}
      </p>
      <p v-if="showMessage" class="text-sm text-primary-dark">
        {{ statusMessage }}
      </p>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    status: {
      type: String,
      default: '',
    },
    interval: {
      type: String,
      default: '',
    },
    recurringTotal: {
      type: Number,
      default: null,
    },
    dateTrialEnd: {
      type: String,
      default: null,
    },
    dateCanceled: {
      type: String,
      default: null,
    },
    datePaused: {
      type: String,
      default: null,
    },
    datePauseEnd: {
      type: String,
      default: null,
    },
    datePeriodEnd: {
      type: String,
      default: null,
    },
    showMessage: {
      type: Boolean,
      default: true,
    },
  },

  computed: {
    icon() {
      switch (this.status) {
        case 'active':
          return 'sync'
        case 'paused':
          return 'pause'
        case 'canceled':
          return 'sync-slash'
        case 'trial':
          return 'calender'
        default:
          return ''
      }
    },

    statusTitle() {
      switch (this.status) {
        case 'active':
          return this.$t('account.subscriptions.subscription.status.active', {
            date: this.formatDate(this.datePeriodEnd),
            time: this.formatTime(this.datePeriodEnd),
          })
        case 'paused':
          return this.datePauseEnd
            ? this.$t(
                'account.subscriptions.subscription.status.pausedResumes',
                {
                  date: this.formatDate(this.datePauseEnd),
                  time: this.formatTime(this.datePauseEnd),
                }
              )
            : this.$t('account.subscriptions.subscription.status.paused', {
                date: this.formatDate(this.datePaused),
              })
        case 'canceled':
          return this.$t('account.subscriptions.subscription.status.canceled', {
            date: this.formatDate(this.dateCanceled),
          })
        case 'trial':
          return this.$t('account.subscriptions.subscription.status.trial', {
            date: this.formatDate(this.dateTrialEnd),
            time: this.formatTime(this.dateTrialEnd),
          })
        default:
          return ''
      }
    },

    statusMessage() {
      switch (this.status) {
        case 'active':
          return this.$t(
            'account.subscriptions.subscription.status.activeMessage'
          )
        case 'paused':
          return this.datePauseEnd
            ? this.$t(
                'account.subscriptions.subscription.status.pausedResumesMessage'
              )
            : this.$t('account.subscriptions.subscription.status.pausedMessage')
        case 'canceled':
          return this.$t(
            'account.subscriptions.subscription.status.canceledMessage'
          )
        case 'trial':
          return `${this.$t(
            'account.subscriptions.subscription.status.trialMessage'
          )}`
        default:
          return ''
      }
    },
  },

  methods: {
    formatTime(date) {
      const d = new Date(date)
      return d.toLocaleString('en', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
      })
    },
  },
}
</script>
