<template>
  <div class="relative mx-6 lg:mx-8 my-8">
    <div class="flex flex-row flex-wrap">
      <div
        v-for="(mention, index) in mentions"
        :key="`mention-${index}`"
        class="mention relative w-1/2 md:w-1/4 py-12 md:py-24 px-4 flex justify-center items-center cursor-pointer"
      >
        <div class="mention-logo">
          <img
            v-if="mention.image"
            class=" max-w-34 h-8 w-auto"
            :style="`transform: scale(${mention.logoScale / 100})`"
            :src="mention.image.url"
            :alt="mention.name"
          />
        </div>

        <div class="mention-text absolute w-full md:px-4">
          <p v-balance-text class="label-sm text-center">&rdquo;{{ mention.quote }}&ldquo;</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SectionPressMentions',

  props: {
    mentions: {
      type: Array,
      default: () => []
    }
  }
}
</script>

<style lang="postcss" scoped>
.mention-logo,
.mention-text {
  @apply transform transition-all ease-in-out;
}

.mention-logo {
  @apply duration-500;
}

.mention-text {
  @apply opacity-0 translate-y-4 duration-200;
}

.mention {
  &:hover {
    & .mention-logo {
      @apply opacity-0 -translate-y-4 duration-200;
    }

    & .mention-text {
      @apply opacity-100 translate-y-0 duration-500;
    }
  }
}
</style>
