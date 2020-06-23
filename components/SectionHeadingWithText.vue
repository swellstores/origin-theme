<template>
  <section class="container py-16 lg:py-24 xl:py-32">
    <div :class="{ 'md:flex': layout !== 'multi_column' }">
      <h2
        v-balance-text
        :class="{ 'md:w-1/3': layout !== 'multi_column' }"
        class="mb-8 max-w-2/3 md:mb-0 md:text-5xl xl:text-7xl"
      >
        {{ heading }}
      </h2>
      <div
        :class="{
          'multi-column-text md:mt-8 lg:mt-10 xl:mt-12': layout === 'multi_column',
          'md:w-2/3 md:pl-12 lg:pl-16 xl:pl-20': layout === 'heading_left',
          'md:w-2/3 md:pl-12 lg:pl-16 xl:pl-20': layout === 'heading_right'
        }"
        class="lg:text-lg"
      >
        {{ text }}
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'SectionHeadingWithText',

  props: {
    heading: {
      type: String,
      default: ''
    },
    text: {
      type: String,
      default: ''
    },
    layout: {
      type: String,
      default: 'heading_left'
    }
  }
}
</script>

<style lang="postcss" scoped>
.multi-column-text {
  @screen md {
    column-count: 2;
    column-gap: 3rem;
  }
}
</style>
