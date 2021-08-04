<template>
  <div
    v-if="attribute"
    class="py-3 flex flex-no-wrap border-b border-primary-med"
  >
    <strong class="w-1/4 text-primary-darkest pr-6">{{
      attribute.name
    }}</strong>
    <span v-if="Array.isArray(attribute.value)" class="w-3/4">
      {{ attribute.value.join(', ') }}
    </span>
    <span v-else class="w-3/4">{{ attribute.value }}</span>
  </div>
</template>

<script>
export default {
  props: {
    attribute: {
      type: Object,
      default: () => {},
    },
  },
}
</script>
