<template>
  <!-- Error/empty state -->
  <SectionUndefined
    v-if="!panels.length"
    heading="Multiple panels"
    description="No panels added"
  />

  <section v-else class="relative flex flex-wrap">
    <div
      v-for="(panel, index) in panels"
      :key="id + 'multiPanel' + index"
      class="relative min-h-72 w-full md:w-1/2 lg:min-h-96"
      :class="[
        `bg-${bgColor}`,
        {
          'px-6 py-20 md:px-12 md:py-16 lg:px-26 lg:py-32':
            panel.type === 'text' && panel.heading,
          'text-left': textAlign === 'left',
          'text-right': textAlign === 'right',
          'text-center': textAlign === 'center',
        },
      ]"
    >
      <!-- Empty states -->
      <div
        v-if="!panel.type"
        class="m-6 border border-dashed py-32 text-center"
      >
        <h3>Panel {{ index + 1 }}</h3>
        <p>No type chosen</p>
      </div>
      <div
        v-else-if="!panel.image && !panel.heading"
        class="m-6 border border-dashed py-32 text-center"
      >
        <h3>Panel {{ index + 1 }}</h3>
        <p>No content added</p>
      </div>
      <!-- Image panel -->
      <template v-else-if="panel.type === 'image'">
        <BaseLink v-if="panel.url" :link="panel.url">
          <VisualMedia
            :source="panel.image"
            :is-background="true"
            sizes="(min-width: 768px) 50vw, 100vw"
          />
        </BaseLink>
        <VisualMedia
          v-else
          :source="panel.image"
          :is-background="true"
          sizes="(min-width: 768px) 50vw, 100vw"
        />
        <!-- TODO Fixed aspect ratio + background behavior? -->
      </template>
      <!-- Text panel -->
      <template v-else-if="panel.type === 'text'">
        <h2>{{ panel.heading }}</h2>
        <div
          v-balance-text.children
          class="mt-4 whitespace-pre-line"
          v-html="panel.description"
        />
        <div :class="{ '-ml-3': panel.textAlign !== 'center' }">
          <div
            v-for="(link, i) in panel.links"
            :key="`link-${i}`"
            :class="{ 'inline-block': panel.links.length < 3 }"
          >
            <BaseButton
              class="mx-3 mt-6 inline-block"
              :type="link.style"
              :link="link.url"
              :label="link.label"
              fit="auto"
            />
          </div>
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
      default: null,
    },
    id: {
      type: String,
      default: null,
    },
    panels: {
      type: Array,
      default: () => [],
    },
    textAlign: {
      type: String,
      default: null,
    },
    bgColor: {
      type: String,
      default: 'primary-lightest',
    },
  },
};
</script>
