<template>
  <!-- Error/empty state -->
  <SectionUndefined v-if="!panels.length" heading="Multiple panels" description="No panels added" />

  <section v-else class="relative flex flex-wrap lg:container">
    <div
      v-for="(panel, index) in panels"
      :key="id + 'multiPanel' + index"
      class="relative w-full min-h-72 md:w-1/2 lg:min-h-96"
      :class="[
        `bg-${panel.bgColor}`,
        {
          'px-6 py-20 md:px-12 md:py-16 lg:px-26 lg:py-32': panel.type === 'text',
          'text-left': textAlign === 'left',
          'text-right': textAlign === 'right',
          'text-center': textAlign === 'center'
        }
      ]"
    >
      <!-- Image panel -->
      <template v-if="panel.type === 'image'">
        <VisualMedia :source="panel.image" :is-background="true" />
        <!-- TODO Fixed aspect ratio + background behavior? -->
      </template>
      <!-- Text panel -->
      <template v-else-if="panel.type === 'text'">
        <h2>{{ panel.heading }}</h2>
        <p class="mt-4">{{ panel.description }}</p>
        <div :class="{ '-ml-3': textAlign !== 'center' }">
          <div
            v-for="(link, i) in panel.links"
            :key="`link-${i}`"
            class="m-1 mx-2"
            :class="{ 'inline-block': panel.links.length < 3 }"
          >
            <NuxtLink
              v-if="link"
              :to="resolveUrl(link)"
              :class="{
                'cta-link mt-4 mb-1 mx-3': link.style === 'text',
                'btn mt-5 mx-3': link.style === 'button_primary'
              }"
              class="inline-block"
              >{{ link.label }}</NuxtLink
            >
          </div>
        </div>
      </template>
      <template v-else>
        <div class="m-6 py-32 border border-dashed text-center">
          <h3>Panel {{ index + 1 }}</h3>
          <p>No type chosen</p>
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
