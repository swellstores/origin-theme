<template>
  <div v-if="sections">
    <div v-for="(section, index) in sections" :key="JSON.stringify(section)">
      <SectionAsyncLoader :section="section" :collection-index="index" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'StandardPage',

  async fetch() {
    const { $swell, $route } = this
    const slug = $route.params.slug || 'home'
    const page = await $swell.content.get('pages', slug)

    // Show 404 if page data isn't found
    if (page === null) {
      if (process.server) {
        this.$nuxt.context.res.statusCode = 404
      }
      throw new Error('Page not found')
    }

    this.sections = page && page.sections ? [...page.sections] : []
  },

  data() {
    return {
      sections: []
    }
  }
}
</script>
