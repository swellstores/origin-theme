<template>
  <div class="rounded bg-primary-lightest py-4 shadow-md md:py-0">
    <div class="container grid grid-cols-1 gap-4 md:grid-cols-2 md:p-4">
      <div
        class="mb-4 grid md:mb-0"
        :class="{
          'grid-cols-1 gap-4 md:grid-cols-2': thumbnails.length === 1,
          'grid-cols-2 gap-4': thumbnails.length === 2,
          'grid-cols-2 grid-rows-2 gap-4': thumbnails.length > 2,
        }"
      >
        <div
          v-for="(media, index) in thumbnails"
          :key="`product-media-${index}`"
          class="relative overflow-hidden rounded"
        >
          <VisualMedia :source="media" size="240px" />

          <template v-if="subscription.product.bundle && thumbnails.length > 1">
            <div
              v-if="
                subscription.product.bundleItems.length > thumbnails.length &&
                index === thumbnails.length - 1
              "
            >
              <div class="overlay" />
              <span
                class="center-xy absolute text-lg font-semibold text-primary-lightest"
              >
                +{{
                  subscription.product.bundleItems.length - thumbnails.length
                }}
              </span>
            </div>
          </template>
        </div>
      </div>

      <div class="flex flex-col">
        <h2 class="mb-1 text-xl">
          {{ subscription.product.name }}
        </h2>

        <p v-if="options" class="label-sm">
          <span class="pr-2">{{ options }}</span>
        </p>

        <p class="label-sm-bold mb-4">
          <span class="pr-2"
            >{{
              formatMoney(subscription.recurringTotal, subscription.currency)
            }}
            {{ subscription.interval }}</span
          >
        </p>

        <AccountSubscriptionStatus
          class="md:mb-4"
          :status="subscription.status"
          :interval="subscription.interval"
          :date-trial-end="subscription.dateTrialEnd"
          :date-canceled="subscription.dateCanceled"
          :date-paused="subscription.datePaused"
          :date-period-end="subscription.datePeriodEnd"
          :recurring-total="subscription.recurringTotal"
          :show-message="false"
        />

        <BaseButton
          class="mt-5 md:mt-auto"
          appearance="light"
          :label="$t('account.subscriptions.subscription.view')"
          :link="localePath(`/account/subscriptions/${subscription.id}/`)"
        />
      </div>
    </div>
  </div>
</template>

<script>
import get from 'lodash/get'

export default {
  props: {
    subscription: {
      type: Object,
      default: null,
    },
  },

  computed: {
    thumbnails() {
      // Determine which images to display
      const { subscription } = this

      // Check for bundle item images
      if (subscription.product.bundle) {
        const bundleThumbnails = subscription.product.bundleItems
          .map((item) => {
            if (item.variant?.images?.length) {
              return get(item, 'variant.images[0].file', false)
            }

            if (item.product?.images?.length) {
              return get(item, 'product.images[0].file', false)
            }

            return false
          })
          .filter(Boolean)

        // Return only first four
        return bundleThumbnails.slice(0, 4)
      }

      // Otherwise use subscription images
      if (subscription.variant?.images?.length) {
        return [get(subscription, 'variant.images[0]')]
      }

      if (subscription.product.images) {
        return [get(subscription, 'product.images[0]')]
      }

      return []
    },

    options() {
      // Return options excluding plan
      if (!this.subscription.variant) return

      const options = this.subscription.variant.name.split(', ')

      if (options.length < 2) return

      return options.slice(1).join(', ')
    },
  },
}
</script>

<style lang="postcss" scoped>
.overlay {
  @apply absolute top-0 left-0 h-full w-full bg-primary-darker opacity-50;
}
</style>
