<template>
  <!-- Error/empty state -->
  <div v-if="!panels.length" class="py-24 text-center">
    <h3>Multiple panels</h3>
    <p>No items added</p>
  </div>

  <section v-else class="relative flex flex-wrap">
    <div
      v-for="(panel, index) in panels"
      :key="id + 'multiPanel' + index"
      class="relative w-full md:w-1/2"
      :class="[
        `bg-${panel.bgColor}`,
        {
          'pl-6 pr-12 py-20 md:px-12 md:py-16 lg:px-26 lg:py-32': panel.type === 'text',
          'text-left': textAlign === 'left',
          'text-right': textAlign === 'right',
          'text-center': textAlign === 'center'
        }
      ]"
    >
      <!-- Image panel -->
      <template v-if="panel.type === 'image'">
        <VisualMedia :source="panel.image.url" :is-background="true" />
        <!-- TODO Fixed aspect ratio + background behavior? -->
      </template>
      <!-- Text panel -->
      <template v-else>
        <h2 class="mb-3">{{ panel.heading }}</h2>
        <p class="mb-2">{{ panel.description }}</p>
        <div
          v-for="(link, i) in panel.links"
          :key="`link-${i}`"
          :class="{ 'inline-block': panel.links.length < 3 }"
        >
          <NuxtLink
            v-if="link"
            :to="resolveUrl(link)"
            :class="{
              'cta-link mt-3 mb-1 mr-6': link.style === 'text',
              'btn mt-4 mr-2': link.style === 'button_primary'
            }"
            class="inline-block"
            >{{ link.label }}</NuxtLink
          >
        </div>
      </template>
    </div>
  </section>
</template>

<script>
export default {
  name: 'SectionMultiPanel',

  props: {
    type: {
      type: String,
      default: null
    },
    id: {
      type: String,
      default: null
    },
    panels: {
      type: Array,
      default: () => []
    },
    textAlign: {
      type: String,
      default: 'left'
    }
  }
}
</script>
