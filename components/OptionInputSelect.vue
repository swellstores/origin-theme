<template>
  <div>
    <ProductOptionLabel v-bind="option" />
    <!-- Dropdown -->
    <div v-if="option.displayType === 'dropdown'" class="mt-3">
      <div class="sc-select transition">
        <!-- Value/Toggle -->
        <button
          :id="`option-${option.id}-button`"
          :class="{ 'rounded-b-none': dropdownIsActive }"
          :aria-labelledby="`option-${option.id}-label option-${option.id}-button`"
          class="scs__dropdown-toggle rounded"
          aria-haspopup="listbox"
          @click="toggleDropdown"
        >
          <span
            :style="`background: ${currentValue.color}`"
            class="inline-block w-6 h-6 rounded-sm mr-3"
          ></span>
          <span>{{ currentValue }}</span>
          <div v-show="dropdownIsActive" class="scs__toggle-icon">
            <BaseIcon icon="uil:angle-up" />
          </div>
          <div v-show="!dropdownIsActive" class="scs__toggle-icon">
            <BaseIcon icon="uil:angle-down" />
          </div>
        </button>
        <!-- Options -->
        <ul
          v-show="dropdownIsActive"
          :id="`option-${option.id}-menu`"
          :class="{ 'rounded-t-none': dropdownIsActive }"
          :aria-labelledby="`option-${option.id}-label`"
          class="scs__dropdown-menu rounded"
          role="listbox"
        >
          <li
            v-for="value in option.values"
            :id="`value-${value.name}`"
            :key="value.name"
            class="scs__dropdown-option"
            role="option"
            @click="selectValue(value)"
          >
            <span
              v-if="value.color"
              :style="`background: ${value.color}`"
              class="inline-block w-6 h-6 rounded-sm mr-3"
            ></span>
            <span class="my-2">{{ value.name }}</span>
          </li>
        </ul>
      </div>
    </div>
    <!-- Radio/Swatch -->
    <!-- The fieldset element doesn't like flexbox, so we're using a div instead https://stackoverflow.com/questions/28078681/why-cant-fieldset-be-flex-containers -->
    <div v-else role="group" class="-ml-1 mt-3 flex flex-wrap">
      <div
        v-for="value in option.values"
        :key="value.name"
        :class="value.color ? 'flex-grow-0' : 'flex-grow'"
        class="radio-selector relative inline-block ml-1 mt-1 text-center"
      >
        <input
          :id="value.id"
          :name="option.name"
          :value="value.name"
          :disabled="value.disabled"
          type="radio"
          class="absolute inset-0 opacity-0"
          @input="$emit('value-changed', { option: option.name, value: $event.target.value })"
        />
        <label
          :for="value.id"
          :class="{
            'border-primary-darkest': value.name === currentValue,
            'text-primary-med': value.disabled
          }"
          class="relative block w-full rounded text-sm border font-semibold cursor-pointer hover:border-primary-darkest focus:shadow-outline"
        >
          <span
            v-if="value.color"
            :style="`background: ${value.color}`"
            class="block w-8 h-8 m-1 rounded-sm"
          ></span>
          <span v-else class="block p-3 min-w-16">{{ value.name }}</span>
        </label>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'OptionInputSelect',

  props: {
    option: {
      type: Object,
      default: () => ({
        values: []
      })
    },
    currentValue: {
      type: String,
      default: ''
    }
  },

  data() {
    return {
      dropdownIsActive: false
    }
  },

  methods: {
    toggleDropdown() {
      this.dropdownIsActive = !this.dropdownIsActive
    },
    selectValue(value) {
      this.dropdownIsActive = false
    }
  }
}
</script>

<style lang="postcss">
.radio-selector input {
  &:focus + label {
    @apply shadow-outline;
  }
}

.sc-select {
  @apply relative z-10 text-sm;

  &:hover {
    @apply border-primary-darkest;
  }
}

.scs__dropdown-toggle {
  @apply relative w-full px-4 py-3 flex items-center border font-semibold cursor-pointer;

  &:focus {
    @apply outline-none;
  }
}

.scs__toggle-icon {
  @apply absolute right-3 mt-px;
}

.scs__dropdown-menu {
  @apply absolute block -mt-px w-full bg-primary-lightest py-2 border;
}

.scs__dropdown-option {
  @apply inline-block px-4 flex items-center cursor-pointer;

  &:hover {
    @apply font-semibold;
  }
}
</style>
