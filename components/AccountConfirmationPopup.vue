<template>
  <transition name="float" :duration="700" appear>
    <div class="z-40 fixed flex items-center justify-center inset-0">
      <!-- Overlay -->
      <div
        class="overlay opacity-50 absolute w-full h-full bg-primary-darker z-10"
        @click="$emit('click-close')"
      />

      <!-- Panel -->
      <div
        class="
          panel
          z-20
          w-full
          py-6
          mx-6
          rounded
          bg-primary-lighter
          md:absolute md:center-xy md:w-128 md:h-auto
        "
      >
        <div class="container">
          <div class="flex mb-5">
            <h3 v-if="heading">
              {{ heading }}
            </h3>
            <button class="ml-auto" @click.prevent="$emit('click-close')">
              <BaseIcon icon="uil:multiply" size="sm" />
            </button>
          </div>

          <p class="mb-10">
            {{ promptMessage }}
          </p>

          <div class="block md:mb-0 md:flex">
            <BaseButton
              class="w-full mb-4 md:w-1/2 md:ml-4 md:mb-0 md:order-2"
              appearance="dark"
              :label="acceptLabel"
              :loading-label="loadingLabel"
              :is-loading="isLoading"
              @click.native="accept()"
            />

            <BaseButton
              class="w-full md:w-1/2 md:mb-0 md:order-1"
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
      default: '',
    },
    promptMessage: {
      type: String,
      default: '',
      required: true,
    },
    acceptLabel: {
      type: String,
      default: '',
    },
    refuseLabel: {
      type: String,
      default: '',
    },
    loadingLabel: {
      type: String,
      default: '',
    },
    isLoading: {
      type: Boolean,
      default: false,
    },
  },

  methods: {
    accept() {
      this.$emit('accept')
    },

    refuse() {
      this.$emit('click-close')
    },
  },
}
</script>
