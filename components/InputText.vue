<template>
  <div>
    <label v-if="label" class="label-xs-bold-faded block mb-2">{{
      label
    }}</label>
    <input
      class="tracking-inherit"
      :type="type"
      :value="value"
      :disabled="disabled"
      :placeholder="placeholder"
      :name="name"
      :autocomplete="autocomplete"
      @input="$emit('input', $event.target.value)"
    />

    <span v-if="hint" class="inline-block text-sm text-primary-dark mt-1">{{
      hint
    }}</span>
  </div>
</template>

<script>
export default {
  props: {
    label: {
      type: String,
      default: '',
    },
    hint: {
      type: String,
      default: '',
    },
    value: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      default: 'text',
    },
    placeholder: {
      type: String,
      default: '',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    name: {
      type: String,
      default: '',
    },
    autocomplete: {
      type: String,
      default: '',
    },
  },
}
</script>

<style lang="postcss" scoped>
#address-dropdown ul {
  @apply max-h-40;
}

input {
  @apply w-full px-4 py-3 bg-primary-lightest border border-primary-med rounded transition ease-in-out duration-200;

  &:focus {
    @apply outline-none;
    border-bottom: var(--colors-primary-dark) 1px solid;
  }

  &:disabled {
    @apply opacity-50 cursor-not-allowed bg-primary-med border-t-0 border-l-0 border-r-0 border-primary-darker;
  }
}
</style>
