<template>
  <div>
    <ProductOptionLabel v-bind="option" />

    <!-- Radio input -->
    <!-- The fieldset element doesn't like flexbox, so we're using a div instead https://stackoverflow.com/questions/28078681/why-cant-fieldset-be-flex-containers -->
    <div v-if="inputType === 'radio'" role="group" class="-ml-1 flex flex-wrap">
      <div
        v-for="value in option.values"
        :key="value.name"
        :class="{ 'flex-grow': option.values.length <= 2 }"
        class="radio-selector relative inline-block ml-1 mt-1 text-center"
      >
        <input
          :id="value.id"
          :name="option.name"
          :value="value.name"
          :disabled="value.disabled"
          type="radio"
          class="absolute inset-0 opacity-0"
          @input="
            $emit('value-changed', {
              option: option.name,
              value: $event.target.value,
            })
          "
        />
        <label
          :for="value.id"
          :class="{
            'border-primary-darkest': value.name === currentValue,
            'text-primary-med': value.disabled,
          }"
          class="
            relative
            block
            w-full
            rounded
            text-sm
            border border-primary-med
            font-semibold
            cursor-pointer
            hover:border-primary-darkest
            focus:shadow-outline
          "
        >
          <span
            v-if="value.color"
            :style="`background: ${value.color}`"
            class="block w-8 h-8 m-1 rounded-sm"
          />
          <span v-else class="block p-3 min-w-12">{{ value.name }}</span>
        </label>
      </div>
    </div>

    <!-- Select menu input -->
    <div v-else>
      <div
        class="
          relative
          text-sm
          bg-primary-lightest
          hover:border-primary-darkest
        "
      >
        <!-- Value/Toggle -->
        <button
          :id="`option-${option.id}-button`"
          :class="{ 'rounded-b-none': dropdownIsActive }"
          :aria-labelledby="`option-${option.id}-label option-${option.id}-button`"
          class="
            relative
            w-full
            flex
            p-2
            items-center
            border border-primary-med
            bg-primary-lightest
            font-semibold
            cursor-pointer
            rounded
            focus:outline-none focus:shadow-outline
          "
          aria-haspopup="listbox"
          @click="toggleDropdown"
        >
          <span
            v-if="swatchColor"
            :style="`background: ${swatchColor}`"
            class="inline-block w-7 h-7 mr-1 rounded-sm"
          />
          <span class="ml-2 my-1">{{ currentValue || initialValue }}</span>
          <div v-show="dropdownIsActive" class="absolute right-3 mt-px">
            <BaseIcon icon="uil:angle-up" />
          </div>
          <div v-show="!dropdownIsActive" class="absolute right-3 mt-px">
            <BaseIcon icon="uil:angle-down" />
          </div>
        </button>
        <!-- Options -->
        <ul
          v-show="dropdownIsActive"
          :id="`option-${option.id}-menu`"
          :class="{ 'rounded-t-none': dropdownIsActive }"
          :aria-labelledby="`option-${option.id}-label`"
          class="
            max-h-25vh
            overflow-scroll
            absolute
            block
            -mt-px
            w-full
            py-2
            border border-primary-med
            bg-primary-lightest
            rounded
            z-10
          "
          role="listbox"
        >
          <li
            v-for="value in option.values"
            :id="`value-${value.name}`"
            :key="value.name"
            class="
              mb-0
              px-2
              flex
              items-center
              cursor-pointer
              hover:bg-primary-lighter
            "
            :class="{ 'text-primary-med': value.name === currentValue }"
            role="option"
            @click="selectValue(value)"
          >
            <span
              v-if="value.color"
              :style="`background: ${swatchColor}`"
              class="inline-block w-7 h-7 mr-1 rounded-sm"
            />
            <span class="m-2 font-semibold">{{ value.name }}</span>
          </li>
        </ul>
      </div>
    </div>

    <span
      v-if="valueDescription && showValueDescription"
      class="inline-block text-xs font-semibold text-primary-dark mt-4"
      >{{ valueDescription }}</span
    >

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
  name: 'OptionInputSelect',

  props: {
    option: {
      type: Object,
      default: () => ({
        values: [],
      }),
    },
    currentValue: {
      type: String,
      default: '',
    },
    showValueDescription: {
      type: Boolean,
      default: true,
    },
    validation: {
      type: Object,
      default: null,
    },
    appearance: {
      type: String,
      default: '',
    }
  },

  data() {
    return {
      active: {
        uid: null,
      },
      dropdownIsActive: false,
    }
  },

  computed: {
    inputType() {
      // Determine what input UI is most suitable
      const { values } = this.option

      if (!values) return 'menu'
      if (this.appearance === 'menu') return 'menu'

      const valueNamesLength = values.reduce((acc, val) => {
        // Don't count color value names because they're displayed as a swatch,
        // and ignore periods and commas because they're visually small
        const nameLength = val.color ? 0 : val.name.replace(/[.,]/g, '')
        return acc + nameLength
      }, 0)

      if (values.length <= 5) {
        // Use a radio input if there's 1-5 options
        return 'radio'
      } else if (values.length <= 15 && valueNamesLength < 25) {
        // Or if there's 6-15 options but they're compact (e.g. sizes, colors)
        return 'radio'
      } else {
        // Otherwise, use a select menu
        return 'menu'
      }
    },

    initialValue() {
      // Set initial value for menu dropdown if a current value isn't supplied
      if (this.currentValue) return

      if (
        !this.option.values ||
        (this.option.values && !this.option.values.length)
      ) {
        return
      }

      return this.option.values[0].name
    },

    valueDescription() {
      const matchedValue = (this.option.values || []).find(
        (value) => value.name === this.currentValue
      )
      if (!matchedValue) return
      return matchedValue.description || ''
    },

    swatchColor() {
      if (!this.currentValue) return
      const currentValue = this.option.values.find(
        (value) => value.name === this.currentValue
      )
      return currentValue.color
    },
  },

  mounted() {
    // Toggle off dropdown if clicked outside
    window.addEventListener('click', this.clickOutside)
  },

  beforeDestroy() {
    // Remove event listeners
    window.removeEventListener('click', this.clickOutside)
  },

  methods: {
    toggleDropdown() {
      this.dropdownIsActive = !this.dropdownIsActive
      if (this.dropdownIsActive) this.$emit('dropdown-active', this._uid)
    },

    selectValue(value) {
      this.$emit('value-changed', {
        option: this.option.name,
        value: value.name,
      })
      this.dropdownIsActive = false
    },

    clickOutside(e) {
      if (!this.$el.contains(e.target)) {
        this.dropdownIsActive = false
      }
    },
  },
}
</script>

<style lang="postcss">
.radio-selector input {
  &:focus + label {
    @apply shadow-outline;
  }
}
</style>
