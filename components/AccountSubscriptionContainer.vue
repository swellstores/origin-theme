<template>
  <div class="bg-primary-lightest md:py-0 py-4 rounded shadow-md">
    <div class="container md:p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
      <div
        class="grid md:mb-0 mb-4"
        :class="{
          'grid-cols-1 md:grid-cols-2 gap-4': thumbnails.length === 1,
          'grid-cols-2 gap-4': thumbnails.length === 2,
          'grid-cols-2 grid-rows-2 gap-4': thumbnails.length > 2,
        }"
      >
        <div
          v-for="(media, index) in thumbnails"
          :key="`product-media-${index}`"
          class="relative rounded overflow-hidden"
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
                class="
                  absolute
                  center-xy
                  text-lg
                  font-semibold
                  text-primary-lightest
                "
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
        <h2 class="text-xl mb-1">
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
  @apply opacity-50 absolute top-0 left-0 w-full h-full bg-primary-darker;
}
</style>
