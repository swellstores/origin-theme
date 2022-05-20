<template>
  <div
    v-if="attribute"
    class="flex-no-wrap flex border-b border-primary-med py-3"
  >
    <strong class="w-1/4 pr-6 text-primary-darkest">{{
      attribute.name
    }}</strong>
    <span class="w-3/4">{{
      formatMoney(attribute.value, currency, false)
    }}</span>
  </div>
</template>

<script>
export default {
  props: {
    attribute: {
      type: Object,
      default: () => {},
    },
    currency: {
      type: String,
      default: null,
    },
  },
};
</script>
