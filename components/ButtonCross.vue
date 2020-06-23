<template functional>
  <button
    type="button"
    :class="data.staticClass"
    class="relative w-6 h-6 rounded-full bg-primary-light"
    v-on="listeners"
  >
    <svg class="absolute w-2 h-2 center-xy"><use xlink:href="#cross-sm" /></svg>
  </button>
</template>

<script>
export default {
  name: 'ButtonCross'
}
</script>
