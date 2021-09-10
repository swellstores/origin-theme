<template>
  <div class="flex" role="img" :aria-label="`${score} of 5 stars`">
    <div
      v-for="star in stars"
      :key="'reviewStar' + star"
      :class="{ 'mr-2': size === 'base', 'mr-1': size === 'sm' }"
      class="text-accent-default last:mr-0"
      aria-hidden="true"
    >
      <BaseIcon v-if="star === 'half'" icon="mdi:star-half" :size="size" />
      <BaseIcon v-else icon="mdi:star" :size="size" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'ReviewStars',

  props: {
    score: {
      type: Number,
      default: 0,
    },
    size: {
      type: String,
      default: 'sm',
    },
  },

  computed: {
    stars() {
      const stars = [...Array(Math.floor(this.score)).keys()]

      if (this.score - stars.length) {
        stars.push('half')
      }

      return stars
    },
  },
}
</script>
