<template>
  <div>
    <div
      v-for="value in option.values"
      :key="value.name"
      class="checkbox relative flex w-full cursor-pointer"
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

      <label class="label-xs-bold w-full text-primary-dark" :for="value.name">
        <p>{{ value.name }}</p>

        <div class="ml-auto flex items-center">
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
