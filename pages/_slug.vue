<template>
  <div>
    <transition-group name="page-section" tag="div">
      <SectionAsyncLoader
        v-for="(section, index) in sections"
        :key="section.id"
        :section="section"
        :collection-index="index"
        :fetch-is-pending="$fetchState.pending"
      />
    </transition-group>
  </div>
</template>

<script>
export default {
  name: 'StandardPage',

  async fetch() {
    const { $swell, $route } = this
    const slug = $route.params.slug || 'home'

    // Set preload data
    if (!this.sections.length) {
      const preloaderSections = ['full_width_media', 'multi_feature', 'multi_panel']
      this.sections = preloaderSections.map((type, index) => ({
        id: 'pageSectionPreloader' + index,
        type
      }))
    }

    const page = await $swell.content.get('pages', slug)

    // Show 404 if page data isn't found
    if (!page) {
      return this.$nuxt.error({ statusCode: 404, message: 'Page not found' })
    }

    // Set component data
    const sections = (page.sections || []).filter(section => section && section.type)

    if (sections && sections.length > 0) {
      this.sections = sections
    }
  },

  data() {
    return {
      sections: []
    }
  }
}
</script>

<style lang="postcss">
.page-section-move {
  @apply transition-transform duration-500 ease-in-out;
}
</style>
