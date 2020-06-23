<template functional>
  <NuxtLink
    :to="props.url"
    class="block rounded-none bg-primary-darkest text-primary-lighter text-sm font-semibold text-center p-2"
    >{{ props.text }}</NuxtLink
  >
</template>

<script>
export default {
  name: 'TheAnnouncementBar',

  props: {
    url: {
      type: String,
      default: '#'
    },
    text: {
      type: String,
      default: '15% off wetsuits'
    }
  }
}
</script>

<style lang="css"></style>
