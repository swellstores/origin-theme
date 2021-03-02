<template>
  <!-- Error/empty state -->
  <SectionUndefined
    v-if="!heading && !text"
    heading="Large media"
    description="No heading or description added"
  />

  <section v-else :class="[`bg-${bgColor}`]" class="text-center py-16 lg:py-24 xl:py-28">
    <div class="container">
      <h2 v-balance-text class="mx-auto px-4 max-w-160">{{ heading }}</h2>
      <p v-balance-text>
        {{ description }}
      </p>
      <div v-if="image" class="relative xl:mx-12">
        <BaseLink v-if="url" :link="url">
          <VisualMedia
            :source="image"
            aspect-ratio="16:9"
            sizes="(min-width: 375px) 80vw, (min-width: 1440px) 70vw, 90vw"
            class="rounded overflow-hidden mt-10 lg:mt-12"
          />
        </BaseLink>

        <VisualMedia
          v-else
          :source="image"
          aspect-ratio="16:9"
          sizes="(min-width: 1200px) 1120px, 100vw"
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
      default: null
    },
    description: {
      type: String,
      default: null
    },
    image: {
      type: [Object, String],
      default: () => ({})
    },
    bgColor: {
      type: String,
      default: 'primary-lighter'
    },
    url: {
      type: String,
      default: null
    }
  }
}
</script>
