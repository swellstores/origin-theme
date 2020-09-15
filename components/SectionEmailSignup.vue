<template>
  <section
    :class="[
      `bg-${bgColor}`,
      { 'flex-row-reverse': alignX === 'right', 'text-center': textAlign === 'center' },
      {
        'mx-0': outerSpacingX === 'none',
        'mx-2 lg:mx-4': outerSpacingX === 'sm',
        'mx-6 lg:mx-8': outerSpacingX === 'md',
        'mx-8 lg:mx-12 xl:mx-16': outerSpacingX === 'lg'
      },
      {
        'my-0': outerSpacingY === 'none',
        'my-2 lg:my-4': outerSpacingY === 'sm',
        'my-6 lg:my-8': outerSpacingY === 'md',
        'my-8 lg:my-12 xl:my-16': outerSpacingY === 'lg'
      }
    ]"
    class="relative flex flex-wrap"
  >
    <div class="relative w-full px-6 py-20 md:w-1/2 md:px-12 md:py-16 lg:px-26 lg:py-32">
      <h2 v-balance-text class="mb-3 text-3xl md:text-4xl lg:text-6xl">
        {{ heading }}
      </h2>
      <p v-balance-text class="mb-6">{{ description }}</p>
      <EmailSignupForm :class="{ 'mx-auto': textAlign === 'center' }" class="max-w-96" />
    </div>
    <div class="relative w-full md:w-1/2">
      <VisualMedia
        v-if="image"
        :source="image"
        :is-background="true"
        sizes="(min-width: 768px) 50vw, 100vw"
      />
    </div>
  </section>
</template>

<script>
export default {
  name: 'SectionEmailSignup',

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
    description: {
      type: String,
      default: null
    },
    image: {
      type: [Object, String],
      default: null
    },
    bgColor: {
      type: String,
      default: 'primary-lighter'
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
    textAlign: {
      type: String,
      default: 'left'
    }
  }
}
</script>
