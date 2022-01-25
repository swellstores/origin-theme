<template>
  <component :is="link ? 'BaseLink' : 'div'" :link="link" :target="target">
    <button
      class="relative"
      :class="[
        {
          'w-full': fit === 'full',
          'w-full md:w-auto': fit === 'auto',
          loading: isLoading,
          disabled: disabled,
          btn: type === 'button_primary',
          'cta-link': type === 'text',
          lighter: textColor === 'light',
          dark: appearance === 'dark',
          light: appearance === 'light',
          'light-error': appearance === 'light-error',
          'btn--lg': size === 'lg',
          'flex items-center justify-center': icon,
        },
      ]"
      :type="buttonType"
      :aria-label="ariaLabel"
    >
      <!-- Loading spinner -->
      <div v-if="loadingLabel" class="center-xy absolute">
        <div v-show="isLoading" class="spinner"></div>
      </div>

      <!-- Button label -->
      <span
        v-if="label"
        :class="{
          'center-xy absolute': fit === 'full',
          'flex items-center justify-center': icon,
        }"
      >
        <!-- Icon, if applicable -->
        <BaseIcon
          v-if="icon"
          :icon="`uil:${icon}`"
          size="sm"
          class="mr-2 inline-block"
        />

        <template v-if="isLoading">
          {{ loadingLabel }}
        </template>
        <template v-else>
          {{ label }}
        </template>
      </span>
    </button>
  </component>
</template>

<script>
export default {
  name: 'BaseButton',

  props: {
    type: {
      type: String,
      default: 'button_primary',
      validator: (value) => ['text', 'button_primary'].includes(value),
    },
    link: {
      type: [Object, String],
      default: '',
    },
    target: {
      type: String,
      default: '_blank',
    },
    appearance: {
      type: String,
      default: '',
    },
    size: {
      type: String,
      default: 'md',
    },
    fit: {
      // Full for full-width, auto for responsive, static for same auto width
      type: String,
      default: 'full',
      validator: (value) => ['full', 'auto', 'static'].includes(value),
    },
    buttonType: {
      type: String,
      default: 'button',
    },
    textColor: {
      type: String,
      default: 'dark',
    },
    isLoading: {
      type: Boolean,
      default: false,
    },
    icon: {
      type: String,
      default: '',
    },
    label: {
      type: String,
      default: '',
    },
    ariaLabel: {
      type: String,
      default: '',
    },
    loadingLabel: {
      type: String,
      default: '',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
}
</script>
