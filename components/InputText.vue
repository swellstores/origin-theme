<template>
  <div>
    <label class="label-xs-bold-faded block mb-2" v-if="label">{{ label }}</label>
    <input
      class="w-full px-4 py-3 bg-primary-lightest border border-primary-med rounded tracking-inherit"
      :type="type"
      :value="value"
      v-on:input="$emit('input', $event.target.value)"
      :disabled="disabled"
      :placeholder="placeholder"
    />
  </div>
</template>

<script>
export default {
  props: {
    label: {
      type: String,
      default: ''
    },
    value: {
      type: String
    },
    type: {
      type: String,
      default: 'text'
    },
    placeholder: {
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

<style lang="postcss">
#address-dropdown ul {
  @apply max-h-40;
}
</style>
