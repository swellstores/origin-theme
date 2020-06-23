<template>
  <div
    :class="{
      'mx-6 lg:mx-8 xl:mx-20': outerSpacingX === 'md',
      'my-6 lg:my-8 xl:my-20': outerSpacingY === 'md'
    }"
    class="relative overflow-hidden"
  >
    <!-- Background image -->
    <VisualMedia
      v-if="image"
      :source="image.url"
      :is-background="true"
      :use-parallax="useParallax"
    />
    <!-- Background darkening overlay -->
    <div
      class="absolute inset w-full h-full bg-primary-darkest"
      :style="{ opacity: darkenBg / 100 }"
    ></div>
    <div
      :class="[
        { 'p-6 sm:p-7 lg:p-8 xl:p-20': outerSpacingX === 'none' && innerSpacing === 'md' },
        { 'p-6 sm:p-7 lg:p-8 xl:p-20': outerSpacingX === 'none' && innerSpacing === 'sm' },
        { 'p-8 sm:p-12 md:p-16 lg:p-20': outerSpacingX === 'md' && innerSpacing === 'md' },
        { 'p-8 md:p-12 lg:p-16': outerSpacingX === 'md' && innerSpacing === 'sm' }
      ]"
      class="relative"
    >
      <!-- Text content -->
      <div
        :class="{
          'max-w-80 md:max-w-96': alignX === 'left',
          'mx-auto text-center max-w-112': alignX === 'center',
          'ml-auto max-w-80 md:max-w-96': alignX === 'right',
          'mt-4 mb-24 md:mt-0': innerSpacing === 'md' && alignY === 'top',
          'my-12': innerSpacing === 'md' && alignY === 'center',
          'mb-4 mt-24 md:mb-0': innerSpacing === 'md' && alignY === 'bottom'
        }"
      >
        <h2
          v-balance-text
          :class="{ 'text-primary-lighter': textColor === 'light' }"
          class="mb-3 text-3xl sm:text-4xl md:text-5xl lg:text-6xl"
        >
          {{ heading }}
        </h2>
        <p v-balance-text :class="{ 'text-primary-light': textColor === 'light' }">
          {{ description }}
        </p>
        <NuxtLink
          v-for="(link, index) in links"
          :key="`link-${index}`"
          to="/products/"
          :title="link.title"
          :class="{
            'cta-link mt-5 mb-1 mr-6': link.style === 'text',
            'btn mt-6 mr-2': link.style === 'button_primary',
            light: textColor === 'light'
          }"
          >{{ link.label }}</NuxtLink
        >
      </div>
      <!-- END Text content -->
    </div>
  </div>
</template>

<script>
export default {
  name: 'SectionFullWidthMedia',

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
      type: [Object, String],
      default: () => ({})
    },
    links: {
      type: Array,
      default: () => []
    },
    textColor: {
      type: String,
      default: 'light'
    },
    darkenBg: {
      type: Number,
      default: 0
    },
    innerSpacing: {
      type: String,
      default: 'md'
    },
    outerSpacingX: {
      type: String,
      default: 'md'
    },
    outerSpacingY: {
      type: String,
      default: 'lg'
    },
    alignX: {
      type: String,
      default: 'left'
    },
    alignY: {
      type: String,
      default: 'top'
    },
    useParallax: {
      type: Boolean,
      default: false
    }
  }
}
</script>
