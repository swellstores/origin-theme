<template functional>
  <div
    :class="{
      'bg-primary-med': props.type !== 'error',
      'bg-error-faded text-error': props.type === 'error'
    }"
    class="z-50 fixed bottom-0 w-full p-3 text-center"
  >
    {{ props.message }}
  </div>
</template>

<script>
export default {
  name: 'TheToastNotification',

  props: {
    message: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: ''
    }
  }
}
</script>

<style lang="css"></style>
