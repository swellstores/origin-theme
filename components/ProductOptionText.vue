<template>
  <div>
    <ProductOptionLabel v-bind="option" />
    <!-- Text -->
    <input
      v-if="option.inputType === 'short_text'"
      :placeholder="option.placeholder"
      class="text-input h-12 mt-3"
      @input="$emit('value-changed', { option: option.name, value: $event.target.value })"
    />
    <!-- Text area -->
    <textarea
      v-else
      :placeholder="option.placeholder"
      class="text-input mt-3"
      @input="$emit('value-changed', { option: option.name, value: $event.target.value })"
    ></textarea>
  </div>
</template>

<script>
export default {
  name: 'OptionInputText',

  props: {
    option: {
      type: Object,
      default: () => ({})
    }
  }
}
</script>

<style lang="postcss" scoped>
.text-input {
  @apply w-full p-4 text-sm border rounded;

  &:focus {
    @apply shadow-outline;
  }
}
</style>
