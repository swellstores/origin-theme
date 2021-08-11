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
          h-vh-gap
          absolute
          bottom-0
          rounded-t
          bg-primary-lighter
          overflow-scroll
          md:w-128 md:h-auto md:max-h-80vh md:relative md:rounded md:center-xy
        "
      >
        <div class="container py-6">
          <div class="flex mb-5">
            <h3 v-if="heading">
              {{ heading }}
            </h3>
            <button class="ml-auto" @click.prevent="$emit('click-close')">
              <BaseIcon icon="uil:multiply" size="sm" />
            </button>
          </div>

          <p v-if="text">
            {{ text }}
          </p>
          <!-- Product options -->
          <div v-for="input in optionInputs" :key="input.name" class="my-4">
            <component
              :is="input.component"
              v-if="visibleOptionIds.includes(input.option.id)"
              :option="input.option"
              :current-value="optionState[input.option.name]"
              :validation="$v.optionState[input.option.name]"
              @value-changed="emitValue"
            />
          </div>

          <!-- Action buttons -->
          <div class="block md:flex mt-16">
            <BaseButton
              class="md:w-1/2 mb-4 md:ml-4 md:mb-0 md:order-2"
              appearance="dark"
              :label="acceptLabel"
              :loading-label="loadingLabel"
              :is-loading="isUpdating"
              @click.native="update()"
            />

            <BaseButton
              class="md:w-1/2 md:mb-0 md:order-1"
              appearance="light"
              :label="refuseLabel"
              @click.native="$emit('click-close')"
            />
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
// Helpers
import { validationMixin } from 'vuelidate'
import { required } from 'vuelidate/lib/validators'
import { listVisibleOptions } from '~/modules/swell'

export default {
  mixins: [validationMixin],

  props: {
    heading: {
      type: String,
      default: '',
    },
    text: {
      type: String,
      default: '',
    },
    acceptLabel: {
      type: String,
      default: 'Save',
    },
    refuseLabel: {
      type: String,
      default: 'Go back',
    },
    loadingLabel: {
      type: String,
      default: 'Saving',
    },
    options: {
      type: Array,
      default: () => [],
    },
    optionState: {
      type: [Object, Array],
      default: () => {},
    },
    isUpdating: {
      type: Boolean,
      default: false,
    },
  },

  computed: {
    visibleOptionIds() {
      const optionState = this.optionState

      return listVisibleOptions(this.options, optionState).map(({ id }) => id)
    },

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
    // Emit value to parent component
    emitValue(value) {
      this.$emit('value-changed', value)
    },

    // Update an option value based on user input
    update() {
      this.$emit('update', this.optionState)
    },
  },

  validations() {
    const { options } = this
    const fields = options.reduce((obj, option) => {
      if (option.required) {
        obj[option.name] = { required }
      }
      return obj
    }, {})

    return {
      optionState: fields,
    }
  },
}
</script>
