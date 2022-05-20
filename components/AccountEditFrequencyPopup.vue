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
          <div class="my-4">
            <ProductFrequencySelect
              v-if="options.length > 0"
              v-model="selectedPlanId"
              :option="options"
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
              @click.native="$emit('update', 'frequency', selectedPlanId)"
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
// import { required } from 'vuelidate/lib/validators';

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
    planId: {
      type: String,
      default: '',
    },
    isUpdating: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      selectedPlanId: this.planId,
    };
  },
};
</script>
