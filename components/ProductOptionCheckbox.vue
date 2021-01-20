<template>
  <div class="relative flex">
    <ProductOptionLabel v-bind="option" />
    <div class="checkbox-wrapper ml-auto">
      <input
        :id="option.name"
        type="checkbox"
        class="absolute right-0 opacity-0"
        @input="
          $emit('value-changed', {
            option: option.name,
            value: $event.target.checked ? option.name : ''
          })
        "
      />
      <label :for="option.name" class="label-sm py-1 pr-6 cursor-pointer">
        <div class="absolute right-0 top-0 text-primary-lightest">
          <BaseIcon icon="uil:check" />
        </div>
        <span v-if="option.price" class="inline-block mr-1">+{{ formatMoney(option.price, currency) }}</span>
      </label>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'OptionInputCheckbox',

  props: {
    option: {
      type: Object,
      default: () => ({})
    },
    currentValue: {
      type: String,
      default: ''
    }
  },

  computed: {
    ...mapState(['currency'])
  }
}
</script>
