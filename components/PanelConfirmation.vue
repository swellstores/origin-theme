<template>
  <transition name="confirmPanel" :duration="700" appear>
    <div class="z-40 fixed flex items-center justify-center inset-0">
      <!-- Overlay -->
      <div
        class="overlay absolute w-full h-full bg-primary-darker z-10"
        @click="$emit('click-close')"
      ></div>

      <!-- Panel -->
      <div class="panel z-20">
        <div class="container">
          <p class="pb-10">{{ promptMessage }}</p>

          <ButtonLoading
            class="dark mb-4"
            @click.native="accept()"
            :label="acceptLabel"
            :loadingLabel="loadingLabel"
            :isLoading="isLoading"
          />

          <button class="btn light w-full" type="button" @click="refuse()">
            {{ refuseLabel }}
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  props: {
    promptMessage: {
      type: String,
      default: '',
      required: true
    },
    acceptLabel: {
      type: String,
      default: ''
    },
    refuseLabel: {
      type: String,
      default: ''
    },
    loadingLabel: {
      type: String,
      default: ''
    },
    isLoading: {
      type: Boolean,
      default: false
    }
  },

  methods: {
    accept() {
      this.$emit('accept')
      this.$emit('click-close')
    },

    refuse() {
      this.$emit('click-close')
    }
  }
}
</script>

<style lang="postcss" scoped>
.overlay {
  @apply opacity-50 absolute w-full h-full bg-primary-darker;
}

.panel {
  @apply w-full mx-6 py-6 rounded bg-primary-lighter;
}

.confirmPanel-enter-active .overlay,
.confirmPanel-leave-active .overlay {
  @apply transition-all duration-500 ease-in-out;
}

.confirmPanel-enter .overlay,
.confirmPanel-leave-to .overlay {
  @apply opacity-0;
}

.confirmPanel-enter-to .overlay,
.confirmPanel-leave .overlay {
  @apply opacity-50;
}

.confirmPanel-enter-active .panel,
.confirmPanel-leave-active .panel {
  @apply transition-all duration-500;
  transition-timing-function: cubic-bezier(0.6, 0.2, 0, 1);
}

.confirmPanel-enter .panel,
.confirmPanel-leave-to .panel {
  @apply transform translate-y-10 opacity-0;
}

.confirmPanel-enter-to .panel,
.confirmPanel-leave .overlay {
  @apply transform translate-y-0 opacity-100;
}
</style>
