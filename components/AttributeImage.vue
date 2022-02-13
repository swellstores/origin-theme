<template>
  <div v-if="attribute">
    <AccordionItem v-if="images.length > 3" :heading="attribute.name">
      <div class="grid grid-cols-3 gap-3 pb-3">
        <button
          v-for="image in images"
          :key="image.id"
          class="relative"
          aria-hidden="true"
          @click="openPreview(image)"
        >
          <div class="group absolute z-10 h-full w-full">
            <div
              class="duration-400 h-full w-full bg-primary-darker opacity-0 transition-opacity group-hover:opacity-50"
            />
            <BaseIcon
              class="center-xy duration-400 absolute text-primary-lightest opacity-0 transition-opacity group-hover:opacity-100"
              icon="uil:search-plus"
            />
          </div>

          <VisualMedia
            class="w-full"
            :source="image"
            :alt="image.filename"
            sizes="(min-width: 768px) 10vw, 20vw"
          />
        </button>
      </div>
    </AccordionItem>

    <div v-else class="flex-no-wrap flex border-b border-primary-med py-3">
      <strong class="w-1/4 pr-6 text-primary-darkest">{{
        attribute.name
      }}</strong>

      <div class="grid w-3/4 grid-cols-3 gap-3">
        <button
          v-for="image in images"
          :key="image.id"
          class="relative"
          aria-hidden="true"
          @click="openPreview(image)"
        >
          <div class="group absolute z-10 h-full w-full">
            <div
              class="duration-400 h-full w-full bg-primary-darker opacity-0 transition-opacity group-hover:opacity-50"
            />
            <BaseIcon
              class="center-xy duration-400 absolute text-primary-lightest opacity-0 transition-opacity group-hover:opacity-100"
              icon="uil:search-plus"
            />
          </div>

          <VisualMedia
            class="w-full"
            :source="image"
            :alt="image.filename"
            sizes="(min-width: 768px) 10vw, 20vw"
          />
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    attribute: {
      type: Object,
      default: () => {},
    },
  },

  data() {
    return {
      previewImage: null,
    }
  },

  computed: {
    images() {
      if (!this.attribute?.value) return []
      if (Array.isArray(this.attribute.value)) {
        return this.attribute.value.map((value) => value.file)
      }
      return [this.attribute.value.file]
    },
  },

  methods: {
    openPreview(image) {
      this.$store.commit('setState', { key: 'mediaPreview', value: image })
      this.$store.commit('setState', {
        key: 'mediaPreviewIsVisible',
        value: true,
      })
    },
  },
}
</script>
