<template>
  <button class="btn" :class="[{ loading: isLoading, disabled: disabled }]" type="button">
    <div class="absolute center-xy">
      <div v-show="isLoading" class="spinner"></div>
    </div>
    <span class="absolute center-xy">
      <template v-if="isLoading">
        {{ loadingLabel }}
      </template>
      <template v-else>
        {{ label }}
      </template>
    </span>
  </button>
</template>

<script>
export default {
  props: {
    isLoading: {
      type: Boolean,
      default: false
    },
    label: {
      type: String,
      default: ''
    },
    loadingLabel: {
      type: String,
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    }
  }
}
</script>
