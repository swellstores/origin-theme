<template>
  <div class="group relative">
    <button
      class="inline-flex items-center gap-1"
      @click="togglePopover"
      @blur="setPopover(false)"
    >
      <BaseIcon :icon="benefit.icon" size="sm" class="mr-2 -mb-1" />
      <span class="font-regular label-sm text-primary-dark">{{
        benefit.text
      }}</span>
    </button>
    <p
      v-show="isPopoverShown"
      class="md:w-fit absolute bottom-0 right-0 left-0 z-10 w-56 translate-y-full -translate-x-6 transform bg-primary-lightest p-2 text-sm text-primary-dark shadow-md md:w-80 md:translate-x-0 lg:w-96"
    >
      {{ benefit.description }}
    </p>
  </div>
</template>

<script>
export default {
  name: 'ProductBenefit',

  props: {
    benefit: {
      type: Object,
      default: () => {},
    },
  },

  data() {
    return {
      isPopoverShown: false,
    };
  },

  methods: {
    togglePopover() {
      this.isPopoverShown = !this.isPopoverShown;
    },

    setPopover(val) {
      this.isPopoverShown = val;
    },
  },
};
</script>
