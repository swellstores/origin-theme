<template>
  <component :is="null" v-bind="attributes" :title="link.title || ''">
    <slot />
  </component>
</template>

<script>
export default {
  name: 'BaseLink',
  props: {
    link: {
      type: [Object, String],
      required: true,
    },
  },
  computed: {
    attributes() {
      const url = this.resolveUrl(this.link)

      if (url.match(/^(http(s)?|ftp):\/\//)) {
        return {
          is: 'a',
          href: url,
          target: '_blank',
          rel: 'noopener',
        }
      }
      return {
        is: 'nuxt-link',
        to: this.localePath(url),
      }
    },
  },
}
</script>
