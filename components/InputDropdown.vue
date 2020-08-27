<template>
  <div
    ref="dropdown"
    class="relative p-2 cursor-pointer border-primary-light border rounded z-20"
    :class="{ 'border-b-0 rounded-b-none': hideBottomBorder }"
    @click="toggleOptions()"
  >
    <span class="label-sm-bold p-2">{{ selected }}</span>
    <div class="absolute right-0 inline-block mr-1">
      <BaseIcon icon="uil:angle-down" />
    </div>
    <transition
      name="expand"
      @before-enter="hideBottomBorder = true"
      @after-leave="hideBottomBorder = false"
    >
      <div
        v-show="expanded"
        ref="container"
        class="w-full-border absolute center-yb border-primary-light bg-primary-lightest overflow-hidden transition-all ease-in-out duration-1000 -mt-px"
        :class="{ 'border border-t-0 rounded-b': expanded }"
      >
        <ul ref="options">
          <li
            v-for="option in options"
            :key="option.label || option"
            class="px-4 py-3 mb-0 hover:bg-primary-lighter transition-all duration-500 opacity-100"
            @click="selectOption(option)"
          >
            {{ option.label || option }}
          </li>
        </ul>
      </div>
    </transition>
  </div>
</template>

<script>
// Helpers
import find from 'lodash/find'

export default {
  name: 'InputDropdown',

  props: {
    options: {
      type: Array,
      default: () => []
    },
    value: {
      type: String
    }
  },

  data() {
    return {
      expanded: false,
      selected: '',
      hideBottomBorder: false
    }
  },

  created() {
    const { value, options } = this

    if (value !== undefined) {
      if (options && options.length > 0) {
        const selected =
          find(options, value) || find(options, { value }) || find(options, { label: value })
        if (selected !== undefined) {
          this.selected = selected.label || selected
          return
        }
      }

      // Fallback
      this.selected = value
    }
  },

  methods: {
    toggleOptions() {
      const container = this.$refs.container
      if (this.expanded) {
        container.style.height = 0
        this.expanded = false
      } else {
        this.expanded = true
        this.$nextTick(() => {
          const options = this.$refs.options
          if (options) container.style.height = `${options.offsetHeight}px`
        })
      }
    },
    selectOption(option) {
      this.selected = option.label || option
      this.$emit('change', option)
    }
  }
}
</script>

<style lang="postcss" scoped>
.w-full-border {
  width: calc(100% + 2px);
}

.center-yb {
  @apply bottom-0 left-1/2;
  transform: translate3d(-50%, 100%, 0);
}

.expand-enter-active,
.expand-leave-active {
  @apply transition-all duration-500 ease-in-out;
}

.expand-enter,
.expand-leave-to {
  @apply h-0;
}

.expand-enter-to,
.expand-leave {
  @apply h-auto;
}

.expand-enter-active li,
.expand-leave-active li {
  @apply transition-all duration-500 ease-in-out;
  transition-delay: calc(50ms * var(--i));
}

.expand-enter li,
.expand-leave-to li {
  @apply opacity-0;
}

.expand-enter-to li,
.expand-leave li {
  @apply opacity-100;
}
</style>
