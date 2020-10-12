<template>
  <!-- Error/empty state -->
  <SectionUndefined
    v-if="!mentions.length"
    heading="Multiple mentions"
    description="No mentions added"
  />

  <section v-else class="relative mx-6 lg:mx-8 my-8">
    <div class="container flex flex-row flex-wrap text-sm text-center">
      <div
        v-for="(mention, index) in mentions"
        :key="`${id}mention${index}`"
        class="group relative w-1/2 md:w-1/4 py-6 md:py-24 px-4 flex justify-center items-center cursor-default"
      >
        <!-- Logo -->
        <div
          class="transform transition-all duration-300 ease-in-out group-hover:opacity-0 group-hover:-translate-y-4"
        >
          <img
            v-if="mention.logo && mention.logo.file"
            class="max-w-full md:max-w-34 h-auto w-full"
            :style="`transform: scale(${mention.logoScale / 100})`"
            :src="mention.logo.file.url"
            :alt="mention.name"
          />
        </div>
        <!-- Quote -->
        <div
          :class="{
            'absolute opacity-0 translate-y-4 transform transition-all duration-300 ease-in-out group-hover:opacity-100 group-hover:translate-y-0':
              mention.logo
          }"
          class="w-full md:px-4"
        >
          <p v-balance-text class="">&ldquo;{{ mention.quote }}&rdquo;</p>
          <span v-if="mention.name" class="block mt-2 font-semibold">— {{ mention.name }}</span>
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
      default: null
    },
    id: {
      type: String,
      default: null
    },
    mentions: {
      type: Array,
      default: () => []
    }
  }
}
</script>
