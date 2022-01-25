<template>
  <!-- Error/empty state -->
  <SectionUndefined
    v-if="!heading && !features.length"
    heading="Multiple features"
    description="No heading or features added"
  />

  <section v-else class="px-6 py-16 text-center lg:px-8 xl:px-20">
    <h3 class="mx-auto mt-6">
      {{ heading }}
    </h3>
    <div class="mt-6 flex flex-wrap justify-center">
      <div
        v-for="(feature, index) in features"
        :key="id + 'multiFeature' + index"
        :class="{ 'w-48': columnWidth === 'sm' }"
        class="mx-3 my-6 lg:mx-5"
      >
        <div
          v-if="feature"
          class="relative mx-auto h-16 w-16 rounded-full bg-primary-light"
        >
          <BaseIcon :icon="feature.icon" size="lg" class="center-xy absolute" />
        </div>
        <p v-if="feature" class="mt-4 text-lg">
          {{ feature.label }}
        </p>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'SectionMultiFeature',

  props: {
    type: {
      type: String,
      default: null,
    },
    id: {
      type: String,
      default: null,
    },
    heading: {
      type: String,
      default: '',
    },
    features: {
      type: Array,
      default: () => [],
    },
    columnWidth: {
      type: String,
      default: 'sm',
    },
  },
}
</script>
