<template>
  <!-- Error/empty state -->
  <div v-if="!heading && !text" class="py-24 text-center">
    <h3>Heading with text</h3>
    <p>No heading or text added</p>
  </div>

  <section v-else class="container py-16 lg:py-24 xl:py-32">
    <div
      :class="{
        'md:flex': heading_position !== 'top',
        'flex-reverse': heading_position === 'right'
      }"
    >
      <h2
        v-balance-text
        :class="{ 'md:w-1/3': heading_position !== 'top' }"
        class="mb-8 max-w-2/3 md:mb-0 md:text-5xl xl:text-7xl"
      >
        {{ heading }}
      </h2>
      <div
        :class="{
          'sw-multi-column md:mt-8 lg:mt-10 xl:mt-12': heading_position === 'top',
          'md:w-2/3 md:pl-12 lg:pl-16 xl:pl-20': heading_position === 'left',
          'md:w-2/3 md:pr-12 lg:pr-16 xl:pr-20': heading_position === 'right'
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
    type: {
      type: String,
      default: null
    },
    id: {
      type: String,
      default: null
    },
    heading: {
      type: String,
      default: null
    },
    text: {
      type: String,
      default: null
    },
    heading_position: {
      type: String,
      default: 'top'
    }
  }
}
</script>

<style lang="postcss" scoped>
.sw-multi-column {
  @screen md {
    column-count: 2;
    column-gap: 3rem;
  }
}
</style>
