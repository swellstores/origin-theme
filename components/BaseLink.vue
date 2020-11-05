<template>
  <component
    v-bind="linkProps(resolveUrl(link))"
    :is="null"
    :title="link.title"
    :class="[link.cssClasses]"
    aria-current="page"
  >
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
  methods: {
    linkProps(path) {
      if (path.match(/^(http(s)?|ftp):\/\//) || path.target === '_blank') {
        return {
          is: 'a',
          href: path,
          target: '_blank',
          rel: 'noopener'
        }
      }
      return {
        is: 'nuxt-link',
        to: path
      }
    }
  }
}
</script>
