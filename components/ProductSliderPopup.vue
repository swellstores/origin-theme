<template>
  <transition v-if="isOpenModal" name="popup" :duration="700" appear>
    <div class="fixed inset-0 z-100">
      <div
        class="overlay absolute h-full w-full cursor-pointer bg-primary-darker opacity-50"
        @click.self="toggleOpenModal"
      ></div>

      <div
        class="panel h-vh-gap md:center-xy absolute bottom-0 z-100 w-full overflow-y-auto overflow-x-hidden rounded-t bg-primary-lighter p-3 md:relative md:mt-8 md:h-auto md:max-h-80vh md:w-160 md:rounded md:p-6 lg:w-180 xl:w-256"
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

        <header class="pr-1/5 pb-3">
          <slot name="header"></slot>
        </header>

        <!-- modal-body -->
        <div class="modal-body">
          <!-- Media -->
          <ClientOnly>
            <VueGlide v-model="active" :options="glideOptions" class="relative">
              <VueGlideSlide v-if="thumbnailImage" :key="thumbnailImage.id">
                <!-- <div class="aspect-video"> -->
                <VisualMedia
                  class="object-contain"
                  :lazy="false"
                  :source="thumbnailImage"
                  :alt="thumbnailImage.alt"
                />
                <!-- </div> -->
              </VueGlideSlide>

              <VueGlideSlide v-if="youtubeVideo" :key="youtubeVideo.id">
                <ClientOnly>
                  <div class="relative w-full pb-[56.25%]">
                    <VueYouTubeEmbed
                      class="absolute inset-0 object-contain"
                      player-width="100%"
                      player-height="100%"
                      :video-id="youtubeVideo.videoId"
                    ></VueYouTubeEmbed>
                  </div>
                </ClientOnly>
              </VueGlideSlide>

              <template v-if="images">
                <VueGlideSlide v-for="image in images" :key="image.id">
                  <!-- <div class="aspect-video"> -->
                  <VisualMedia
                    class="object-contain"
                    :lazy="false"
                    :source="image"
                    :alt="image.alt"
                  />
                  <!-- </div> -->
                </VueGlideSlide>
              </template>

              <template slot="control">
                <button
                  class="absolute top-1/2 left-0 z-20 translate-y-[-90%] transform rounded-sm bg-primary-lighter p-2 opacity-70 hover:opacity-100"
                  data-glide-dir="<"
                >
                  <BaseIcon icon="uil:angle-left" size="lg" />
                </button>
                <button
                  class="absolute top-1/2 right-0 z-20 translate-y-[-90%] transform rounded-sm bg-primary-lighter p-2 opacity-70 hover:opacity-100"
                  data-glide-dir=">"
                >
                  <BaseIcon icon="uil:angle-right" size="lg" />
                </button>
                <button
                  v-for="index in items"
                  :key="index"
                  :class="{
                    'ml-auto': index === 1 && items !== 1,
                    'mr-auto': index === items && items !== 1,
                    '!mx-auto': items === 1,
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
      default: () => [],
    },

    indicatorColor: {
      type: String,
      default: 'light',
    },

    /* activeSlide: {
      type: Number,
      default: -1,
    }, */
  },

  data() {
    return {
      active: -1,
      // active: this.activeSlide,
      glideOptions: {
        type: 'carousel',

        perView: 1,
        gap: 0,
        animationTimingFunc: 'cubic-bezier(0.6, 0.2, 0, 1)',
      },
    };
  },

  computed: {
    items() {
      const media = [];

      if (this.thumbnailImage) {
        media.push(this.thumbnailImage);
      }

      if (this.youtubeVideo) {
        media.push(this.youtubeVideo);
      }

      if (this.images && this.images?.length > 0) {
        media.push(...this.images);
      }

      return media.length;
    },
  },

  methods: {
    toggleOpenModal() {
      this.$emit('toggle-popup');
      this.active = -1;
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

/* stylelint-disable */
.glide__slide > * {
  @apply !pb-[56.25%];
}
</style>

<style scoped>
[data-glide-el='controls'] {
  display: flex;
  justify-content: center;
}
</style>
