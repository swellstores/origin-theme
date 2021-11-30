<template>
  <div @keyup.enter="emitValueOnEnter">
    <ProductOptionLabel v-bind="option" />
    <!-- Text -->
    <input
      v-if="option.inputType === 'short_text'"
      v-model="value"
      :placeholder="option.inputHint"
      class="text-input h-12 bg-primary-lightest"
      @input="emitValue"
    />
    <!-- Text area -->
    <textarea
      v-else
      v-model="value"
      :placeholder="option.inputHint"
      class="text-input"
      @input="emitValue"
    ></textarea>

    <template v-if="validation">
      <div
        v-if="validation.$dirty && validation.$error"
        class="text-error-default mt-2"
      >
        <span v-if="!validation.required" class="label-sm text-error-default">{{
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
      default: () => ({}),
    },
    emitOnEnter: {
      type: Boolean,
      default: false,
    },
    validation: {
      type: Object,
      default: null,
    },
  },

  data() {
    return {
      value: null,
    }
  },

  methods: {
    emitValue() {
      if (this.emitOnEnter) return
      this.$emit('value-changed', {
        option: this.option.name,
        value: this.value,
      })
    },
    emitValueOnEnter() {
      this.$emit('value-changed', {
        option: this.option.name,
        value: this.value,
      })
    },
  },
}
</script>

<style lang="postcss" scoped>
.text-input {
  @apply w-full p-4 text-sm border border-primary-med rounded;

  &:focus {
    @apply shadow-outline;
  }
}
</style>
