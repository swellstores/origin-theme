<template>
  <transition name="popup" :duration="700" appear>
    <div class="z-40 fixed inset-0">
      <!-- Overlay -->
      <div
        class="overlay opacity-50 absolute w-full h-full bg-primary-darker"
        @click="$emit('click-close')"
      />

      <!-- Panel -->
      <div
        class="
          panel
          w-full
          md:w-128
          h-auto
          md:max-h-80vh
          absolute
          md:relative
          bottom-0
          rounded-t
          md:rounded
          bg-primary-lighter
          overflow-scroll
          md:center-xy
        "
      >
        <div class="container py-6">
          <h3 v-if="heading" class="pb-2">
            {{ heading }}
          </h3>
          <p v-if="text" class="pb-6">
            {{ text }}
          </p>
          <!-- Product options -->
          <div v-for="input in optionInputs" :key="input.name">
            <component
              :is="input.component"
              :option="input.option"
              :current-value="optionState[input.option.name]"
              @value-changed="setOptionValue"
            />
          </div>

          <BaseButton
            class="w-full dark mt-6"
            label="Save"
            loading-label="Saving..."
            :is-loading="isUpdating"
            @click.native="update()"
          />
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
// Helpers
import get from 'lodash/get'

export default {
  props: {
    heading: {
      type: String,
      default: '',
    },
    text: {
      type: String,
      default: '',
    },
    options: {
      type: Array,
      default: () => [],
    },
    isUpdating: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      optionState: null,
    }
  },

  fetch() {
    // Compute initial values for options
    const optionState =
      this.optionState ||
      (this.options || []).reduce((options, { name, values }) => {
        // Set first available value for current option
        options[name] = get(values, '0.name')
        return options
      }, {})

    // Set component data
    this.optionState = optionState
  },

  computed: {
    optionInputs() {
      if (!this.options) return {}
      const options = this.options
      return options.reduce((optionInputs, option) => {
        let componentName

        switch (option.inputType) {
          case 'short_text':
            componentName = 'Text'
            break
          case 'long_text':
            componentName = 'Text'
            break
          case 'toggle':
            componentName = 'Checkbox'
            break
          default:
            componentName = 'Select'
        }

        // Don't include subscription plan if there's only one option value available
        if (option.subscription && option.values.length < 2) return optionInputs

        optionInputs.push({
          option,
          component: () => import(`./ProductOption${componentName}.vue`),
        })

        return optionInputs
      }, [])
    },
  },

  methods: {
    // Update an option value based on user input
    setOptionValue({ option, value }) {
      // Use $set to update the data object because options are dynamic
      // and optionState won't be reactive otherwise
      // TODO in Vue 3 this.optionState[option] = value should work
      this.$set(this.optionState, option, value)
    },

    update() {
      this.$emit('update', this.optionState)
    },
  },
}
</script>
