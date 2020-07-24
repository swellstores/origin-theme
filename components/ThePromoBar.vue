<template functional>
  <div
    :class="[
      'bg-primary-darkest text-primary-lighter text-sm leading-snug font-semibold text-center',
      { hidden: props.hidden }
    ]"
  >
    <NuxtLink v-if="props.url" :to="props.url" class="block rounded-none p-2 text-primary-lighter">
      <span>{{ props.text }}</span>
    </NuxtLink>
    <p v-else class="p-2">{{ props.text }}</p>
  </div>
</template>

<script>
export default {
  name: 'ThePromoBar',

  props: {
    url: {
      type: String,
      default: null
    },
    text: {
      type: String,
      default: null
    },
    hidden: {
      type: Boolean,
      default: false
    }
  }
}
</script>
