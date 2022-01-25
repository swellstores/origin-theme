<template>
  <!-- Error/empty state -->
  <SectionUndefined
    v-if="!heading && !description"
    heading="Heading with text"
    description="No heading or text added"
  />

  <section v-else :class="`bg-${bgColor}`">
    <div
      class="container py-16 lg:py-24 xl:py-32"
      :class="{ 'md:flex': headingPosition === 'left' }"
    >
      <div
        :class="{
          'md:w-1/3': headingPosition === 'left',
          'mx-auto text-center': headingPosition === 'top-center',
          'mx-auto': textColumnWidth === 'compact' && textColumns === 'single',
        }"
        class="max-w-2/3 md:mb-0"
      >
        <span v-if="label" class="label-xs-bold mb-4 block">{{ label }}</span>
        <h2 class="m-0 md:text-5xl xl:text-7xl">
          {{ heading }}
        </h2>
      </div>

      <div
        v-if="description"
        :class="{
          'mx-auto md:w-2/3':
            textColumnWidth === 'compact' && textColumns === 'single',
          'sw-multi-column':
            headingPosition.includes('top') && textColumns === 'dual',
          'mt-8 lg:mt-10 xl:mt-12': headingPosition.includes('top'),
          'mt-1 md:w-2/3 md:pl-12 lg:pl-16 xl:pl-20':
            headingPosition === 'left',
        }"
        class="lg:text-lg"
        v-html="description"
      />
    </div>
  </section>
</template>

<script>
export default {
  name: 'SectionHeadingWithText',

  props: {
    type: {
      type: String,
      default: null,
    },
    id: {
      type: String,
      default: null,
    },
    label: {
      type: String,
      default: null,
    },
    heading: {
      type: String,
      default: null,
    },
    description: {
      type: String,
      default: null,
    },
    bgColor: {
      type: String,
      default: 'primary-lightest',
    },
    headingPosition: {
      type: String,
      default: 'top-center',
    },
    textColumns: {
      type: String,
      default: 'dual',
    },
    textColumnWidth: {
      type: String,
      default: 'compact',
    },
  },
}
</script>

<style lang="postcss" scoped>
.sw-multi-column {
  /* stylelint-disable at-rule-no-unknown */
  @screen md {
    column-count: 2;
    column-gap: 2rem;
  }
}
</style>
