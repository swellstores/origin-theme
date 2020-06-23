<template>
  <div class="relative">
    <div class="flex flex-wrap">
      <div
        v-for="(panel, index) in panels"
        :key="`panel-${index}`"
        class="panel"
        :class="[
          panel.type,
          `bg-${panel.bgColor}`,
          {
            'text-left': textAlign === 'left',
            'text-right': textAlign === 'right',
            'text-center': textAlign === 'center'
          }
        ]"
      >
        <!-- Image -->
        <template v-if="panel.type === 'image'">
          <VisualMedia :source="panel.image.url" :is-background="true" :use-parallax="false" />
          <!-- TODO Fixed aspect ratio + background behavior? -->
        </template>
        <!-- Text -->
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
    </div>
  </div>
</template>

<script>
export default {
  name: 'SectionMultiPanel',

  props: {
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

<style lang="postcss" scoped>
.panel {
  @apply relative w-full border-primary-light border-t pl-6 pr-12 py-20;

  &.image {
    @apply p-0;
  }

  &:last-child {
    @apply border-b;
  }

  @screen md {
    @apply w-1/2 px-12 py-16;

    &:nth-child(odd) {
      @apply border-t border-r;
    }

    &:nth-child(even) {
      @apply border-t;
    }

    &:nth-last-child(-n + 2) {
      @apply border-b;
    }
  }

  @screen lg {
    @apply py-32 px-26;
  }
}
</style>
