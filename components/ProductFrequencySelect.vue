<template>
  <div>
    <!-- Select menu input -->
    <div>
      <div
        class="relative bg-primary-lightest text-sm hover:border-primary-darkest"
      >
        <!-- Value/Toggle -->
        <button
          :id="`option-${option.id}-button`"
          :class="{ 'rounded-b-none': dropdownIsActive }"
          :aria-labelledby="`option-${option.id}-label option-${option.id}-button`"
          class="focus:outline-none relative flex w-full cursor-pointer items-center rounded border border-primary-med p-2 font-semibold"
          aria-haspopup="listbox"
          @click="toggleDropdown"
        >
          <BaseIcon icon="uil:sync" class="mr-2" size="w-4 h-4" />
          <span class="font-normal first-letter:uppercase">{{
            currentValue | formatSubscriptionToLabel
          }}</span>
          <div class="ml-auto">
            <span class="font-semibold">{{
              currentValue | formatSubscriptionToPrice
            }}</span>
          </div>
          <div v-show="dropdownIsActive">
            <BaseIcon icon="uil:angle-up" />
          </div>
          <div v-show="!dropdownIsActive">
            <BaseIcon icon="uil:angle-down" />
          </div>
        </button>
        <!-- Options -->
        <transition name="dropdown">
          <ul
            v-show="dropdownIsActive"
            :id="`option-${option.id}-menu`"
            :class="{ 'rounded-t-none': dropdownIsActive }"
            :aria-labelledby="`option-${option.id}-label`"
            class="absolute z-10 -mt-px block max-h-34 w-full overflow-auto rounded border border-primary-med bg-primary-lightest py-2"
            role="listbox"
          >
            <li
              v-for="value in option"
              :id="`value-${value.id}`"
              :key="value.id"
              class="mb-0 flex cursor-pointer items-center px-2 hover:bg-primary-lighter"
              :class="{
                'text-primary-med':
                  value.id === (currentValue && currentValue.id),
              }"
              role="option"
              @click="selectValue(value)"
            >
              <span class="m-2 font-semibold first-letter:uppercase">{{
                value | formatSubscriptionToLabel
              }}</span>

              <div class="ml-auto">
                <span class="mr-2 font-semibold">{{
                  value | formatSubscriptionToPrice
                }}</span>
              </div>
            </li>
          </ul>
        </transition>
      </div>
    </div>

    <span
      v-if="currentValue && showValueDescription"
      class="mt-4 inline-block text-xs font-semibold text-primary-dark"
      >{{ currentValue && currentValue.description }}</span
    >

    <template v-if="validation">
      <div
        v-if="validation.$dirty && validation.$error"
        class="mt-2 text-error-default"
      >
        <span v-if="!validation.required" class="label-sm text-error-default">{{
          $t('products._slug.options.required')
        }}</span>
      </div>
    </template>
  </div>
</template>

<script>
export default {
  name: 'ProductFrequencySelect',

  model: {
    prop: 'selected',
    event: 'select',
  },

  props: {
    selected: {
      type: String,
      default: '',
    },
    option: {
      type: Array,
      default: () => [],
    },
    showValueDescription: {
      type: Boolean,
      default: true,
    },
    validation: {
      type: Object,
      default: null,
    },
  },

  data() {
    return {
      active: {
        uid: null,
      },
      dropdownIsActive: false,
    };
  },

  computed: {
    currentValue() {
      return this.option.find((value) => value.id === this.selected);
    },
  },
  mounted() {
    window.addEventListener('click', this.clickOutside);
  },

  beforeDestroy() {
    // Remove event listeners
    window.removeEventListener('click', this.clickOutside);
  },

  methods: {
    toggleDropdown() {
      this.dropdownIsActive = !this.dropdownIsActive;
      if (this.dropdownIsActive) this.$emit('dropdown-active', this._uid);
    },

    selectValue(value) {
      this.$emit('select', value.id);
      this.dropdownIsActive = false;
    },

    clickOutside(e) {
      if (!this.$el.contains(e.target)) {
        this.dropdownIsActive = false;
      }
    },
  },
};
</script>

<style lang="postcss">
.radio-selector input {
  &:focus + label {
    @apply shadow-outline;
  }
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.5s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
}
</style>
