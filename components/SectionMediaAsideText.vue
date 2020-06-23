<template>
  <div
    class="relative md:mt-24 my-16"
    :class="{
      'mx-0': outerSpacingX === 'none',
      'mx-2 lg:mx-4': outerSpacingX === 'sm',
      'mx-6 lg:mx-8': outerSpacingX === 'md',
      'mx-8 lg:mx-12 xl:mx-16': outerSpacingX === 'lg'
    }"
  >
    <div class="relative md:flex md:justify-end">
      <div
        v-parallax="{ enabled: useParallax, speed: 16, minW: 768 }"
        class="w-full relative md:w-1/2 md:absolute md:top-0"
        :class="{ 'md:left-0': mediaPosition === 'left', 'md:right-0': mediaPosition === 'right' }"
      >
        <VisualMedia :source="image" />
      </div>

      <div
        class="bg-primary-lighter w-full pl-6 pr-12 py-18 md:pt-34 md:pr-0 md:pl-0 xl:pt-44 md:pb-18 lg:pb-22"
        :class="{
          'md:ml-32 lg:ml-64': mediaPosition === 'left',
          'md:mr-32 lg:mr-64': mediaPosition === 'right'
        }"
      >
        <div
          :class="{
            'ml-auto md:ml-72 md:mr-10 lg:mr-16': mediaPosition === 'left',
            'mr-auto md:ml-10 md:mr-72 lg:ml-16': mediaPosition === 'right'
          }"
        >
          <h2 v-balance-text class="mb-3 text-3xl sm:text-4xl md:text-5xl lg:text-6xl">
            {{ heading }}
          </h2>
          <p v-balance-text>
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
            class="inline-block"
            >{{ link.label }}</NuxtLink
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SectionMediaAsideText',

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
      default: 'dark'
    },
    outerSpacingX: {
      type: String,
      default: 'md'
    },
    outerSpacingY: {
      type: String,
      default: 'lg'
    },
    mediaPosition: {
      type: String,
      default: 'left'
    },
    useParallax: {
      type: Boolean,
      default: false
    }
  }
}
</script>
