<template>
  <div>
    <div
      v-for="(option, i) in filter.options"
      :key="`${option.value || option}-${i}`"
      :class="{
        checkbox: styling === 'check',
        'box-selector': styling === 'box',
      }"
    >
      <input
        :id="`${option.value || option}-${i}`"
        :checked="selectedValues.includes(option.value)"
        :value="option.value"
        :type="type"
        @change="updateValue(option.value)"
      />

      <template v-if="styling === 'box'">
        <label
          :for="`${option}-${i}`"
          class="label-sm-bold transition-all duration-200 ease-in-out"
          >{{ option.label || option }}</label
        >
      </template>

      <template v-else>
        <label :for="`${option.value || option}-${i}`">
          <div class="indicator mr-2 text-primary-lightest">
            <BaseIcon icon="uil:check" size="sm" />
          </div>
          <p>{{ option.label || option }}</p>
        </label>
      </template>
    </div>
  </div>
</template>

<script>
export default {
  name: 'InputSelect',

  props: {
    filter: {
      type: Object,
      default: () => ({}),
    },
    filterState: {
      type: Object,
      default: () => ({}),
    },
    type: {
      type: String,
      default: 'checkbox',
    },
    styling: {
      type: String,
      default: 'check',
    },
  },

  computed: {
    selectedValues() {
      return this.filterState[this.filter.id] || []
    },
  },

  methods: {
    updateValue(optionValue) {
      this.$emit('change', { filter: this.filter, optionValue })
    },
  },
}
</script>

<style lang="postcss">
.box-selector {
  @apply mr-1 flex;

  & label {
    @apply cursor-pointer rounded border border-primary-med px-4 py-2;
  }

  & input {
    @apply invisible m-0 h-0 w-0 appearance-none border-0 p-0;

    &:checked {
      & + label {
        @apply border-primary-darkest;
      }
    }
  }
}
</style>
