<template>
  <div class="rounded bg-primary-light">
    <button
      class="flex w-full cursor-pointer items-center justify-between gap-2 py-4 px-6"
      @click="toggleAccordion"
    >
      <span
        class="pointer-events-none block text-left text-sm font-semibold text-primary-darker"
      >
        {{ label }}
      </span>

      <!-- plus -->
      <svg
        v-if="!isOpen"
        class="fill-primary-dark block flex-shrink-0 flex-grow-0"
        width="20"
        height="20"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M10 0C9.44771 0 9 0.447716 9 1V9H1C0.447715 9 0 9.44771 0 10C0 10.5523 0.447715 11 1 11H9V19C9 19.5523 9.44771 20 10 20C10.5523 20 11 19.5523 11 19V11H19C19.5523 11 20 10.5523 20 10C20 9.44771 19.5523 9 19 9H11V1C11 0.447715 10.5523 0 10 0Z"
        />
      </svg>

      <svg
        v-else
        class="fill-primary-dark block flex-shrink-0 flex-grow-0"
        width="20"
        height="2"
        viewBox="0 0 20 2"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="20" height="2" rx="1" />
      </svg>
    </button>

    <div
      class="pointer-events-none px-6 text-sm text-primary-darker transition-all duration-150 ease-in-out"
      :class="{
        'max-h-0 py-0 opacity-0': !isOpen,
        'max-h-80vh py-4 opacity-100': isOpen,
      }"
      v-html="content"
    ></div>
  </div>
</template>

<script>
export default {
  props: {
    label: {
      type: String,
      default: '',
    },
    content: {
      type: String,
      default: '',
    },
  },

  data() {
    return {
      isOpen: false,
    };
  },

  methods: {
    toggleAccordion() {
      this.isOpen = !this.isOpen;
    },
  },
};
</script>

<style lang="scss" scoped></style>
