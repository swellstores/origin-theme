<template>
  <section class="relative mx-6 lg:mx-8 my-8">
    <div class="flex flex-row flex-wrap text-sm text-center">
      <div
        v-for="(mention, index) in mentions"
        :key="`${id}mention${index}`"
        class="group relative w-1/2 md:w-1/4 py-12 md:py-24 px-4 flex justify-center items-center cursor-default"
      >
        <!-- Logo -->
        <div
          class="transform transition-all duration-300 ease-in-out group-hover:opacity-0 group-hover:-translate-y-4"
        >
          <img
            v-if="mention.image"
            class="max-w-34 h-8 w-auto"
            :style="`transform: scale(${mention.logoScale / 100})`"
            :src="mention.image.url"
            :alt="mention.name"
          />
        </div>
        <!-- Quote -->
        <div
          :class="{
            'opacity-0 translate-y-4 transform transition-all duration-300 ease-in-out group-hover:opacity-100 group-hover:translate-y-0 ':
              mention.image
          }"
          class="absolute w-full md:px-4"
        >
          <p v-balance-text class="">&ldquo;{{ mention.quote }}&rdquo;</p>
          <span v-if="!mention.image" class="block mt-2 font-semibold">— {{ mention.name }}</span>
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
