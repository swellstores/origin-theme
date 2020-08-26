<template>
  <div>
    <div
      v-for="(option, i) in options"
      :key="`${option}-${i}`"
      :class="{ checkbox: styling === 'check', 'box-selector': styling === 'box' }"
    >
      <input
        :id="`${option}-${i}`"
        v-model="value"
        :value="option"
        :type="type"
        @change="$emit('input', value)"
      />

      <template v-if="styling === 'box'">
        <label
          :for="`${option}-${i}`"
          class="label-sm-bold transition-all duration-200 ease-in-out"
          >{{ option }}</label
        >
      </template>

      <template v-else>
        <label :for="`${option}-${i}`">
          <div class="indicator">
            <svg class="w-5 h-5 text-primary-lightest"><use xlink:href="#check" /></svg>
          </div>
          <p>{{ option }}</p>
        </label>
      </template>
    </div>
  </div>
</template>

<script>
export default {
  name: 'InputSelect',

  props: {
    options: {
      type: Array,
      default: () => []
    },
    value: {
      type: Array,
      default: () => []
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

  data() {
    return {}
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
      transition: all 0.4s ease;
    }

    & p {
      @apply ml-3 font-bold;
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
