<template>
  <div>
    <div
      v-for="(option, i) in filter.options"
      :key="`${option.value || option}-${i}`"
      :class="{ checkbox: styling === 'check', 'box-selector': styling === 'box' }"
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
          <div class="indicator text-primary-lightest">
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
      default: () => ({})
    },
    filterState: {
      type: Object,
      default: () => ({})
    },
    type: {
      type: String,
      default: 'checkbox'
    },
    styling: {
      type: String,
      default: 'check'
    }
  },

  computed: {
    selectedValues() {
      return this.filterState[this.filter.id] || []
    }
  },

  methods: {
    updateValue(optionValue) {
      this.$emit('change', { filter: this.filter, optionValue })
    }
  }
}
</script>

<style lang="postcss">
.checkbox {
  @apply flex pb-1;

  & input {
    @apply p-0 m-0 border-0 appearance-none w-0 h-0 invisible;
  }

  & :checked + label {
    & .indicator {
      @apply bg-primary-darkest border-primary-darkest;
    }
  }

  & label {
    @apply relative flex items-center appearance-none;

    & .indicator {
      @apply flex justify-center items-center cursor-pointer w-6 h-6 border border-primary-med rounded;
      transition: all 0.2s ease;
    }

    & p {
      @apply ml-3 font-semibold;
    }
  }

  & .check {
    &:hover {
      opacity: 1;
    }
  }
}

.box-selector {
  @apply flex mr-1;

  & input {
    @apply p-0 m-0 border-0 appearance-none w-0 h-0 invisible;

    &:checked {
      & + label {
        @apply border-primary-darkest;
      }
    }
  }

  & label {
    @apply cursor-pointer rounded border border-primary-med px-4 py-2;
  }
}
</style>
