<template>
  <transition name="float" :duration="700" appear>
    <div class="fixed inset-0 z-40 flex items-center justify-center">
      <!-- Overlay -->
      <div
        class="overlay absolute z-10 h-full w-full bg-primary-darker opacity-50"
        @click="$emit('click-close')"
      />

      <!-- Panel -->
      <div
        class="panel md:center-xy z-20 mx-6 w-full rounded bg-primary-lighter py-6 md:absolute md:h-auto md:w-128"
      >
        <div class="container">
          <div class="mb-5 flex">
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
              class="mb-4 w-full md:order-2 md:ml-4 md:mb-0 md:w-1/2"
              appearance="dark"
              :label="acceptLabel"
              :loading-label="loadingLabel"
              :is-loading="isLoading"
              @click.native="accept()"
            />

            <BaseButton
              class="w-full md:order-1 md:mb-0 md:w-1/2"
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
