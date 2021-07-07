<template>
  <div @keyup.enter="emitValueOnEnter">
    <ProductOptionLabel v-bind="option" />
    <!-- Text -->
    <input
      v-if="option.inputType === 'short_text'"
      v-model="value"
      :placeholder="option.inputHint"
      class="text-input h-12 mt-3"
      @input="emitValue"
    />
    <!-- Text area -->
    <textarea
      v-else
      v-model="value"
      :placeholder="option.inputHint"
      class="text-input mt-3"
      @input="emitValue"
    ></textarea>

    <template v-if="validation">
      <div v-if="validation.$dirty && validation.$error" class="text-error mt-2">
        <span v-if="!validation.required" class="label-sm text-error">{{
          $t('products.slug.options.required')
        }}</span>
      </div>
    </template>
  </div>
</template>

<script>
export default {
  name: 'OptionInputText',

  props: {
    option: {
      type: Object,
      default: () => ({})
    },
    emitOnEnter: {
      type: Boolean,
      default: false
    },
    validation: {
      type: Object,
      default: null
    }
  },

  data() {
    return {
      value: null
    }
  },

  methods: {
    emitValue() {
      if (this.emitOnEnter) return
      this.$emit('value-changed', { option: this.option.name, value: this.value })
    },
    emitValueOnEnter() {
      this.$emit('value-changed', { option: this.option.name, value: this.value })
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
