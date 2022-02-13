<template>
  <transition v-if="mediaPreview" name="fade" :duration="700" appear>
    <!-- Overlay -->
    <button class="fixed inset-0 z-50 flex items-center justify-center">
      <span class="sr-only">Close modal</span>
      <div
        class="overlay absolute block h-full w-full bg-primary-darker opacity-50"
        @click="closePreview"
      />

      <div class="max-w-3/4">
        <VisualMedia
          img-class="max-h-80vh mx-auto w-auto"
          :source="mediaPreview"
          :aspect-ratio="`${mediaPreview.width}:${mediaPreview.height}`"
          :alt="mediaPreview.filename"
          :is-fixed="true"
          sizes="(min-width: 768px) 80vw, 100vw"
        />
      </div>
    </button>
  </transition>
</template>

<script>
import { mapState } from 'vuex'

export default {
  computed: { ...mapState(['mediaPreview']) },

  methods: {
    closePreview() {
      this.$store.commit('setState', {
        key: 'mediaPreviewIsVisible',
        value: false,
      })
      this.$store.commit('setState', { key: 'mediaPreview', value: null })
    },
  },
}
</script>
