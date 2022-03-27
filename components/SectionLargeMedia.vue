<template>
  <!-- Error/empty state -->
  <SectionUndefined
    v-if="image && !heading && !description && !Object.entries(image).length"
    heading="Large media"
    description="No heading or description added"
  />

  <section
    v-else
    :class="[`bg-${bgColor}`]"
    class="py-16 text-center lg:py-24 xl:py-28"
  >
    <div class="container">
      <h2 class="mx-auto max-w-160 px-4">
        {{ heading }}
      </h2>
      <div v-if="description" v-balance-text.children v-html="description" />
      <div v-if="image" class="relative xl:mx-12">
        <BaseLink v-if="url" :link="url">
          <VisualMedia
            :source="image"
            aspect-ratio="16:9"
            sizes="(min-width: 375px) 80vw, (min-width: 1440px) 70vw, 90vw"
            class="overflow-hidden rounded"
            :class="{ 'mt-10 lg:mt-12': description || heading }"
          />
        </BaseLink>

        <VisualMedia
          v-else
          :source="image"
          aspect-ratio="16:9"
          sizes="(min-width: 1200px) 1120px, 100vw"
          class="overflow-hidden rounded"
          :class="{ 'mt-10 lg:mt-12': description || heading }"
        />
      </div>
      <span v-if="caption" class="label-sm mt-3 inline-block">{{
        caption
      }}</span>
    </div>
  </section>
</template>

<script>
export default {
  name: 'SectionLargeMedia',

  props: {
    heading: {
      type: String,
      default: null,
    },
    description: {
      type: String,
      default: null,
    },
    image: {
      type: [Object, String],
      default: () => ({}),
    },
    bgColor: {
      type: String,
      default: 'primary-lighter',
    },
    url: {
      type: String,
      default: null,
    },
    caption: {
      type: String,
      default: null,
    },
  },
}
</script>
