<template>
  <!-- Error/empty state -->
  <SectionUndefined
    v-if="!heading && !image"
    heading="Full width media"
    description="No heading or media added"
  />

  <!-- Skeleton loader -->
  <div
    v-else-if="fetchIsPending"
    class="flex flex-col items-center justify-center bg-primary-lighter py-20"
  >
    <div class="loader-el mb-2 h-7 w-1/2" />
    <div class="loader-el mb-6 h-7 w-1/3" />
    <div class="loader-el mb-4 h-2 w-3/5" />
    <div class="loader-el mb-8 h-2 w-2/5" />
    <div class="loader-el h-10 w-40" />
  </div>

  <!-- Section content -->
  <div v-else :class="`bg-${bgColor}`" class="overflow-auto">
    <section
      :class="{
        'mx-6 lg:mx-8 xl:mx-20': outerSpacingX === 'md',
        'my-6 lg:my-8 xl:my-20': outerSpacingY === 'md',
      }"
      class="relative overflow-hidden"
    >
      <!-- Background image -->
      <VisualMedia
        v-if="image && (image.file || image.url)"
        :source="image"
        :is-background="true"
        sizes="(min-resolution: 2dppx) 50vw, 80vw"
      />
      <!-- Background darkening overlay -->
      <div
        v-if="textColor === 'light'"
        class="inset absolute h-full w-full bg-primary-darkest"
        :style="{ opacity: darkenBg / 100 }"
      />
      <div
        :class="[
          {
            'p-6 sm:p-7 lg:p-8 xl:p-20':
              outerSpacingX === 'none' && innerSpacing === 'md',
          },
          {
            'p-6 sm:p-7 lg:p-8 xl:p-20':
              outerSpacingX === 'none' && innerSpacing === 'sm',
          },
          {
            'p-8 sm:p-12 md:p-16 lg:p-20':
              outerSpacingX === 'md' && innerSpacing === 'md',
          },
          {
            'p-8 md:p-12 lg:p-16':
              outerSpacingX === 'md' && innerSpacing === 'sm',
          },
        ]"
        class="relative"
      >
        <!-- Text content -->
        <div
          :class="{
            'max-w-80 md:max-w-96': alignX === 'left',
            'mx-auto max-w-112 text-center': alignX === 'center',
            'ml-auto max-w-80 md:max-w-96': alignX === 'right',
            'mt-4 mb-24 md:mt-0': innerSpacing === 'md' && alignY === 'top',
            'my-12': innerSpacing === 'md' && alignY === 'center',
            'mb-4 mt-24 md:mb-0': innerSpacing === 'md' && alignY === 'bottom',
          }"
        >
          <h2
            :class="{ 'text-primary-lightest': textColor === 'light' }"
            class="mb-3 text-3xl sm:text-4xl md:text-5xl lg:text-6xl"
          >
            {{ heading }}
          </h2>
          <!-- Tell prettier not to add extra whitespace -->
          <!-- display: inline -->
          <p
            :class="{ 'text-primary-lighter': textColor === 'light' }"
            class="whitespace-pre-line"
            v-html="description"
          >
          </p>
          <div class="mx-3 mt-6" :class="{ '-ml-3': alignX !== 'center' }">
            <BaseButton
              v-for="(link, index) in links"
              :key="id + 'link' + index"
              class="mx-3 mt-6"
              :type="link.style"
              fit="static"
              :text-color="textColor"
              :link="link"
              :label="link.label"
            />
          </div>
        </div>
        <!-- END Text content -->
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: 'SectionFullWidthMedia',

  props: {
    fetchIsPending: {
      type: Boolean,
      default: true,
    },
    id: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      default: '',
    },
    heading: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    image: {
      type: [Object, String],
      default: () => ({}),
    },
    links: {
      type: Array,
      default: () => [],
    },
    textColor: {
      type: String,
      default: 'light',
    },
    darkenBg: {
      type: Number,
      default: 0,
    },
    innerSpacing: {
      type: String,
      default: 'md',
    },
    outerSpacingX: {
      type: String,
      default: 'md',
    },
    outerSpacingY: {
      type: String,
      default: 'lg',
    },
    alignX: {
      type: String,
      default: 'left',
    },
    alignY: {
      type: String,
      default: 'top',
    },
    bgColor: {
      type: String,
      default: 'primary-lightest',
    },
  },
}
</script>
