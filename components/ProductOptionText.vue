<template>
  <div @keyup.enter="emitValueOnEnter">
    <ProductOptionLabel v-bind="option" />
    <!-- Text -->
    <input
      v-if="option.inputType === 'short_text'"
      :value="value"
      :placeholder="option.inputHint"
      class="text-input h-12 bg-primary-lightest"
      @input="emitValue"
    />
    <!-- Text area -->
    <textarea
      v-else
      :value="value"
      :placeholder="option.inputHint"
      class="text-input"
      @input="emitValue"
    ></textarea>

    <template v-if="validation">
      <div
        v-if="validation.$dirty && validation.$error"
        class="mt-2 text-error-default"
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
    currentValue: {
      type: String,
      default: '',
    },
  },

  data() {
    return {
      internalValue: null,
    }
  },

  computed: {
    value() {
      return this.emitOnEnter ? this.internalValue : this.currentValue
    },
  },

  methods: {
    emitValue(event) {
      const { value } = event.target
      if (this.emitOnEnter) {
        this.internalValue = value
      } else {
        this.$emit('value-changed', {
          option: this.option.name,
          value,
        })
      }
    },
    emitValueOnEnter() {
      if (!this.emitOnEnter) return
      this.$emit('value-changed', {
        option: this.option.name,
        value: this.internalValue,
      })
    },
  },
}
</script>

<style lang="postcss" scoped>
.text-input {
  @apply w-full rounded border border-primary-med p-4 text-sm;

  &:focus {
    @apply shadow-outline;
  }
}
</style>
