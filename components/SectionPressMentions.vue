<template>
  <!-- Error/empty state -->
  <SectionUndefined
    v-if="!mentions.length"
    heading="Multiple mentions"
    description="No mentions added"
  />

  <section v-else class="relative mx-6 my-8 lg:mx-8">
    <div class="container flex flex-row flex-wrap text-center text-sm">
      <div
        v-for="(mention, index) in mentions"
        :key="`${id}mention${index}`"
        class="group relative flex w-1/2 cursor-default items-center justify-center py-6 px-4 md:w-1/4 md:py-24"
      >
        <!-- Logo -->
        <div
          class="transform transition-all duration-300 ease-in-out group-hover:-translate-y-4 group-hover:opacity-0"
        >
          <img
            v-if="mention.logo && mention.logo.file"
            class="h-auto w-full max-w-full md:max-w-34"
            :style="`transform: scale(${mention.logoScale / 100})`"
            :src="mention.logo.file.url"
            :alt="mention.name"
          />
        </div>
        <!-- Quote -->
        <div
          :class="{
            'absolute translate-y-4 transform opacity-0 transition-all duration-300 ease-in-out group-hover:translate-y-0 group-hover:opacity-100':
              mention.logo,
          }"
          class="w-full md:px-4"
        >
          <p class="">&ldquo;{{ mention.quote }}&rdquo;</p>
          <span v-if="mention.name" class="mt-2 block font-semibold"
            >— {{ mention.name }}</span
          >
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'SectionPressMentions',

  props: {
    type: {
      type: String,
      default: null,
    },
    id: {
      type: String,
      default: null,
    },
    mentions: {
      type: Array,
      default: () => [],
    },
  },
}
</script>
