<template>
  <div>
    <label class="label-xs-bold-faded block mb-2" v-if="label">{{ label }}</label>
    <input
      class="w-full px-4 py-3 bg-primary-lightest border border-primary-med rounded"
      type="text"
      :value="value"
      v-on:input="$emit('input', $event.target.value)"
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
    }
  }
}
</script>

<style lang="scss" scoped></style>
