<template>
  <transition v-if="isOpenModal" name="popup" :duration="700" appear>
    <div class="fixed inset-0 z-100">
      <div
        class="overlay absolute h-full w-full cursor-pointer bg-primary-darker opacity-50"
        @click.self="toggleOpenModal"
      ></div>

      <div
        class="panel h-vh-gap md:center-xy absolute bottom-0 z-100 w-full overflow-y-auto overflow-x-hidden rounded-t bg-primary-lighter p-3 md:relative md:mt-8 md:h-auto md:max-h-80vh md:w-160 md:rounded md:p-6"
      >
        <button
          class="aspect-square group absolute top-2 right-2 inline-flex items-center justify-center rounded p-3 leading-none hover:bg-error-default focus:bg-error-default focus:text-primary-lightest md:top-4 md:right-4"
          @click="toggleOpenModal"
        >
          <BaseIcon
            class="fill-primary-darkest text-primary-darkest group-hover:text-primary-lightest group-focus:text-primary-lightest"
            icon="uil:times"
          />
        </button>

        <header class="pb-3">
          <slot name="header"></slot>
        </header>

        <!-- modal-body -->
        <div class="modal-body">
          <!-- Media -->
          <ClientOnly>
            <VueGlide v-model="active" :options="glideOptions">
              <VueGlideSlide v-if="thumbnailImage" :key="thumbnailImage.id">
                <VisualMedia
                  :lazy="false"
                  :source="thumbnailImage"
                  :alt="thumbnailImage.alt"
                />
              </VueGlideSlide>

              <VueGlideSlide v-if="youtubeVideo" :key="youtubeVideo.id">
                <ClientOnly>
                  <VueYouTubeEmbed
                    player-width="100%"
                    :video-id="youtubeVideo.videoId"
                  ></VueYouTubeEmbed>
                </ClientOnly>
              </VueGlideSlide>

              <VueGlideSlide v-for="image in images" :key="image.id">
                <VisualMedia :lazy="false" :source="image" :alt="image.alt" />
              </VueGlideSlide>

              <template slot="control">
                <button
                  v-for="index in items.length"
                  :key="index"
                  :class="{
                    'ml-auto': index === 1,
                    'mr-auto': index === items.length,
                    'bg-primary-lighter':
                      indicatorColor === 'light' && active === index - 1,
                    'bg-primary-darkest':
                      indicatorColor === 'dark' && active === index - 1,
                    'border-primary-lighter': indicatorColor === 'light',
                    'border-primary-darkest': indicatorColor === 'dark',
                  }"
                  class="transition-color m-2 inline-block rounded-full border p-2 transition"
                  :data-glide-dir="`=${index - 1}`"
                />
              </template>
            </VueGlide>
          </ClientOnly>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
// Helpers

// import '@glidejs/glide/dist/css/glide.core.min.css';

export default {
  name: 'ProductSliderPopup',

  components: {
    async VueYouTubeEmbed() {
      const { YouTubePlayer } = await import('vue-youtube-embed');

      return YouTubePlayer;
    },

    async VueGlide() {
      const { Glide } = await import('vue-glide-js');
      return Glide;
    },
    async VueGlideSlide() {
      const { GlideSlide } = await import('vue-glide-js');
      return GlideSlide;
    },
  },

  props: {
    isOpenModal: {
      type: Boolean,
      default: false,
    },

    thumbnailImage: {
      type: Object,
      default: null,
    },

    youtubeVideo: {
      type: Object,
      default: null,
    },

    images: {
      type: Array,
      default: null,
    },

    indicatorColor: {
      type: String,
      default: 'light',
    },
  },

  data() {
    return {
      active: 0,
      glideOptions: {
        type: 'carousel',

        perView: 1,
        gap: 0,
        animationTimingFunc: 'cubic-bezier(0.6, 0.2, 0, 1)',
      },

      items: [
        this.thumbnailImage,
        this.youtubeVideo,
        ...(this.images && this.images.length > 0 && this.images),
      ],
    };
  },

  methods: {
    toggleOpenModal() {
      this.$emit('toggle-popup');
    },

    setActiveSlide(index) {
      this.active = index;
    },
  },
};
</script>

<style lang="postcss" scoped>
@import url('vue-glide-js/dist/vue-glide.css');

.embed-youtube {
  position: relative;
  padding-bottom: 56.25%; /* - 16:9 aspect ratio (most common) */

  /* padding-bottom: 62.5%; - 16:10 aspect ratio */

  /* padding-bottom: 75%; - 4:3 aspect ratio */
  padding-top: 30px;
  height: 0;
  overflow: hidden;
}

.embed-youtube iframe,
.embed-youtube object,
.embed-youtube embed {
  border: 0;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

[data-glide-el='controls'] {
  @apply flex w-full flex-row justify-center;
}
</style>

<style scoped>
[data-glide-el='controls'] {
  display: flex;
  justify-content: center;
}
</style>
