<template>
  <div>
    <label v-if="label" class="label-xs-bold-faded mb-2 block">{{
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

    <span v-if="hint" class="mt-1 inline-block text-sm text-primary-dark">{{
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
  @apply w-full rounded border border-primary-med bg-primary-lightest px-4 py-3 transition duration-200 ease-in-out;

  &:focus {
    border-bottom: var(--colors-primary-dark) 1px solid;
    @apply outline-none;
  }

  &:disabled {
    @apply cursor-not-allowed border-t-0 border-l-0 border-r-0 border-primary-darker bg-primary-med opacity-50;
  }
}
</style>
