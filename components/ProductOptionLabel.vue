<template>
  <div class="mb-3 flex items-start justify-between">
    <div class="relative w-full">
      <div class="mr-6">
        <label
          :id="`option-${id}-label`"
          :for="name"
          class="label-xs-bold inline-block text-primary-dark"
          >{{ name }}</label
        >
        <a
          v-if="description"
          href="#"
          class="relative -mt-1 -mb-1 ml-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary-light text-center"
          title="More info"
          @click.prevent="toggleHint"
        >
          <BaseIcon icon="fa-solid:question" size="w-2 h-3" />
          <div v-show="isHintVisible" class="mini-triangle" />
        </a>
      </div>
      <div
        v-show="isHintVisible"
        class="absolute z-20 mt-1 -ml-2 w-64 rounded border border-primary-med bg-primary-lightest px-3 py-2 text-sm shadow-lg"
      >
        {{ description }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProductOptionLabel',

  props: {
    id: {
      type: String,
      default: '',
    },
    name: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      isHintVisible: false,
    }
  },
  methods: {
    toggleHint() {
      this.isHintVisible = !this.isHintVisible
    },
  },
}
</script>
