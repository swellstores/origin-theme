<template>
  <transition name="popup" :duration="700" appear>
    <div class="fixed inset-0 z-40">
      <!-- Overlay -->
      <div
        class="overlay absolute h-full w-full bg-primary-darker opacity-50"
        @click="$emit('click-close')"
      />

      <!-- Panel -->
      <div
        class="panel h-vh-gap md:center-xy absolute bottom-0 w-full overflow-auto rounded-t bg-primary-lighter md:relative md:h-auto md:max-h-80vh md:w-128 md:rounded"
      >
        <div class="container py-6">
          <div class="mb-5 flex">
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
          <div class="mt-16 block md:flex">
            <BaseButton
              class="mb-4 md:order-2 md:ml-4 md:mb-0 md:w-1/2"
              appearance="dark"
              :label="acceptLabel"
              :loading-label="loadingLabel"
              :is-loading="isUpdating"
              @click.native="update()"
            />

            <BaseButton
              class="md:order-1 md:mb-0 md:w-1/2"
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
import { validationMixin } from 'vuelidate';
import { required } from 'vuelidate/lib/validators';
import { listVisibleOptions } from '~/modules/swell/utils/listVisibleOptions';

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
      const optionState = this.optionState;

      return listVisibleOptions(this.options, optionState).map(({ id }) => id);
    },

    optionInputs() {
      if (!this.options) return {};
      const options = this.options;
      return options.reduce((optionInputs, option) => {
        let componentName;

        switch (option.inputType) {
          case 'short_text':
            componentName = 'Text';
            break;
          case 'long_text':
            componentName = 'Text';
            break;
          case 'toggle':
            componentName = 'Checkbox';
            break;
          default:
            componentName = 'Select';
        }

        // Don't include subscription plan if there's only one option value available
        if (option.subscription && option.values.length < 2)
          return optionInputs;

        optionInputs.push({
          option,
          component: () => import(`./ProductOption${componentName}.vue`),
        });

        return optionInputs;
      }, []);
    },
  },

  methods: {
    // Emit value to parent component
    emitValue(value) {
      this.$emit('value-changed', value);
    },

    // Update an option value based on user input
    update() {
      this.$emit('update', this.optionState);
    },
  },

  validations() {
    const { options } = this;
    const fields = options.reduce((obj, option) => {
      if (option.required) {
        obj[option.name] = { required };
      }
      return obj;
    }, {});

    return {
      optionState: fields,
    };
  },
};
</script>
