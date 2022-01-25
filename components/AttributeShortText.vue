<template>
  <div
    v-if="attribute"
    class="flex-no-wrap flex border-b border-primary-med py-3"
  >
    <strong class="w-1/4 pr-6 text-primary-darkest">{{
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
