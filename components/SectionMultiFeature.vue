<template>
  <!-- Error/empty state -->
  <SectionUndefined
    v-if="!features.length"
    heading="Multiple features"
    description="No features added"
  />

  <section v-else class="text-center px-6 py-16 lg:px-8 xl:px-20">
    <h3 class="mx-auto mt-6">{{ heading }}</h3>
    <div class="flex flex-wrap justify-center mt-6">
      <div
        v-for="(feature, index) in features"
        :key="id + 'multiFeature' + index"
        :class="{ 'w-48': columnWidth === 'sm' }"
        class="mx-3 my-6 lg:mx-5"
      >
        <div v-if="feature" class="relative rounded-full bg-primary-light mx-auto w-16 h-16">
          <BaseIcon :icon="feature.icon" size="lg" class="absolute center-xy" />
        </div>
        <p v-if="feature" class="text-lg mt-4">{{ feature.label }}</p>
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
      default: null
    },
    id: {
      type: String,
      default: null
    },
    heading: {
      type: String,
      default: ''
    },
    features: {
      type: Array,
      default: () => []
    },
    columnWidth: {
      type: String,
      default: 'sm'
    }
  }
}
</script>
