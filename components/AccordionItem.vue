<template>
  <div class="border-b border-primary-med">
    <div :class="{ container: useContainer }">
      <div
        class="z-10 flex cursor-pointer flex-row items-center"
        @click="toggleExpanded()"
      >
        <strong class="text-md py-3">{{ heading }}</strong>
        <div
          class="transition-fast ml-auto transition-all ease-in-out"
          :class="{ 'rotate-1/2': isExpanded }"
        >
          <BaseIcon icon="uil:angle-down" size="lg" />
        </div>
      </div>

      <HeightExpansion>
        <div v-show="isExpanded">
          <slot />
        </div>
      </HeightExpansion>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AccordionItem',

  props: {
    index: {
      type: Number,
      default: 0,
    },
    heading: {
      type: String,
      default: 'Heading',
    },
    useContainer: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      isExpanded: false,
    }
  },

  methods: {
    toggleExpanded() {
      this.isExpanded = !this.isExpanded
    },
  },
}
</script>
