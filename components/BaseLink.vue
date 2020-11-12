<template>
  <component v-bind="attributes" :is="null" :title="link.title">
    {{ link.label }}
  </component>
</template>

<script>
export default {
  name: 'BaseLink',
  props: {
    link: {
      type: Object,
      required: true
    }
  },
  computed: {
    attributes() {
      const url = this.resolveUrl(this.link)

      if (url.match(/^(http(s)?|ftp):\/\//)) {
        return {
          is: 'a',
          href: url,
          target: '_blank',
          rel: 'noopener'
        }
      }
      return {
        is: 'nuxt-link',
        to: url
      }
    }
  }
}
</script>
