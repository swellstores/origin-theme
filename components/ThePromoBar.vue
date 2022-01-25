<template>
  <div
    :class="[
      'bg-primary-darkest text-center text-sm font-semibold leading-snug text-primary-lighter',
      { hidden: hidden },
    ]"
  >
    <NuxtLink
      v-if="url"
      :to="localePath(url)"
      class="block rounded-none p-2 text-primary-lighter"
    >
      <span>{{ text }}</span>
    </NuxtLink>
    <p v-else class="p-2">
      {{ text }}
    </p>
  </div>
</template>

<script>
export default {
  name: 'ThePromoBar',

  props: {
    url: {
      type: String,
      default: null,
    },
    text: {
      type: String,
      default: null,
    },
    hidden: {
      type: Boolean,
      default: false,
    },
  },
}
</script>
