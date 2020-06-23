<template functional>
  <div
    :class="[
      // Duplicate sizing classes to maintain element size while loading
      { 'w-5 h-5': props.size === 'sm' },
      { 'w-6 h-6': props.size === 'base' },
      { 'w-7 h-7': props.size === 'lg' },
      // Custom sizing classes
      props.size.length > 3 ? props.size : '',
      // Classes set on component
      data.staticClass
    ]"
  >
    <ClientOnly>
      <span
        :class="[
          `iconify icon:${props.icon}`,
          { 'w-5 h-5': props.size === 'sm' },
          { 'w-6 h-6': props.size === 'base' },
          { 'w-7 h-7': props.size === 'lg' },
          // Custom sizing classes
          props.size.length > 3 ? props.size : ''
        ]"
        aria-hidden="true"
      >
      </span>
    </ClientOnly>
  </div>
</template>

<script>
export default {
  name: 'BaseIcon',

  props: {
    icon: {
      type: String,
      default: 'uil:check'
    },
    size: {
      type: String,
      default: 'base'
    },
    customSize: {
      type: String,
      default: ''
    }
  }
}
</script>

<style lang="postcss" scoped>
svg.iconify {
  animation: fade-in 0.25s ease-out;
}
</style>
