<template>
  <div class="flex justify-between items-start">
    <div class="relative w-full">
      <div class="mr-6">
        <label
          :id="`option-${id}-label`"
          :for="name"
          class="inline-block label-xs-bold text-primary-dark"
          >{{ name }}</label
        >
        <a
          v-if="description"
          href="#"
          class="relative w-7 h-7 -mt-1 -mb-1 ml-2 inline-flex items-center justify-center bg-primary-light rounded-full text-center"
          title="More info"
          @click.prevent="toggleHint"
        >
          <BaseIcon icon="fa-solid:question" size="w-2 h-3" />
          <div v-show="isHintVisible" class="mini-triangle"></div>
        </a>
      </div>
      <div
        v-show="isHintVisible"
        v-balance-text
        class="absolute z-20 mt-1 -ml-2 bg-primary-lightest border rounded px-3 py-2 w-64 text-sm shadow-lg"
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
      default: ''
    },
    name: {
      type: String,
      default: ''
    },
    description: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      isHintVisible: false
    }
  },
  methods: {
    toggleHint() {
      this.isHintVisible = !this.isHintVisible
    }
  }
}
</script>
