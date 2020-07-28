<template>
  <section :class="[`bg-${bgColor}`]" class="text-center py-16 lg:py-24 xl:py-28">
    <div class="container">
      <h2 v-balance-text class="mx-auto px-4 max-w-160">{{ heading }}</h2>
      <div class="relative xl:mx-12">
        <VisualMedia
          v-if="image"
          :source="image.url"
          aspect-ratio="16:9"
          class="rounded overflow-hidden mt-10 lg:mt-12"
        />
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'SectionLargeMedia',

  props: {
    heading: {
      type: String,
      default: ''
    },
    description: {
      type: String,
      default: ''
    },
    image: {
      type: Object,
      default: () => ({})
    },
    bgColor: {
      type: String,
      default: 'primary-lighter'
    }
  }
}
</script>
