<template>
  <div>
    <div
      v-for="value in option.values"
      :key="value.name"
      class="w-full checkbox relative flex cursor-pointer"
    >
      <input
        :id="value.name"
        type="checkbox"
        @input="
          $emit('value-changed', {
            option: value.name,
            value: $event.target.checked ? value.name : '',
          })
        "
      />

      <label class="w-full label-xs-bold text-primary-dark" :for="value.name">
        <p>{{ value.name }}</p>

        <div class="flex items-center ml-auto">
          <span v-if="value.price" class="mr-2"
            >+{{ formatMoney(value.price, currency) }}</span
          >
          <div class="indicator ml-auto">
            <BaseIcon icon="uil:check" size="sm" class="text-primary-lighter" />
          </div>
        </div>
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
      default: () => ({}),
    },
    currentValue: {
      type: String,
      default: '',
    },
  },

  computed: {
    ...mapState(['currency']),
  },
}
</script>
