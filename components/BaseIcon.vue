<template functional>
  <ClientOnly>
    <div
      :class="[
        // Duplicate sizing classes to maintain element size while loading
        { 'h-5 w-5': props.size === 'sm' },
        { 'h-6 w-6': props.size === 'base' },
        { 'h-7 w-7': props.size === 'lg' },
        // Custom sizing classes
        props.size.length > 3 ? props.size : '',
        // Classes set on component
        data.staticClass,
      ]"
    >
      <span
        :class="[
          `iconify icon:${props.icon}`,
          { 'h-5 w-5': props.size === 'sm' },
          { 'h-6 w-6': props.size === 'base' },
          { 'h-7 w-7': props.size === 'lg' },
          // Custom sizing classes
          props.size.length > 3 ? props.size : '',
        ]"
        aria-hidden="true"
      />
    </div>
  </ClientOnly>
</template>

<script>
export default {
  name: 'BaseIcon',

  props: {
    icon: {
      type: String,
      default: 'uil:check',
    },
    size: {
      type: String,
      default: 'base',
    },
    customSize: {
      type: String,
      default: '',
    },
  },
}
</script>

<style lang="postcss" scoped>
svg.iconify {
  animation: fade-in 0.25s ease-out;
}
</style>
