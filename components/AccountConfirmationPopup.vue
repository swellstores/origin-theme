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
          <h3 v-if="heading">{{ heading }}</h3>
          <p class="pb-10">{{ promptMessage }}</p>

          <div class="block mb-4 md:mb-0 md:flex">
            <BaseButton
              class="w-full md:w-1/2 md:mr-2 md:mb-0"
              appearance="dark"
              :label="acceptLabel"
              :loading-label="loadingLabel"
              :is-loading="isLoading"
              @click.native="accept()"
            />

            <BaseButton
              class="w-full md:w-1/2 md:mr-2 md:mb-0"
              appearance="light"
              :label="refuseLabel"
              @click.native="refuse()"
            />
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  props: {
    heading: {
      type: String,
      default: ''
    },
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

  @screen md {
    @apply absolute w-128 h-auto rounded left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2;
  }
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
  @apply transform translate-y-1/4 opacity-0;

  @screen md {
    transform: translate(-50%, calc(-50% + 5rem));
  }
}

.confirmPanel-enter-to .panel,
.confirmPanel-leave .overlay {
  @apply transform translate-y-0 opacity-100;

  @screen md {
    transform: translate(-50%, -50%);
  }
}
</style>
