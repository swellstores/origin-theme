<template>
  <div>
    <transition-group name="page-section" tag="div">
      <div v-for="(section, index) in sections" :key="section.id">
        <SectionAsyncLoader
          :section="section"
          :collection-index="index"
          :fetch-is-pending="$fetchState.pending"
        />
      </div>
    </transition-group>
  </div>
</template>

<script>
// Helpers
import get from 'lodash/get'

export default {
  name: 'StandardPage',

  async fetch() {
    const { $swell, $route } = this
    const slug = $route.params.slug || 'home'

    const preloadSections = ['undefined'].map((type, index) => ({
      id: 'pageSectionPreloader' + index,
      type
    }))

    // Set preload data
    if (!this.sections.length) {
      this.sections = preloadSections
    }

    const page = await $swell.content.get('pages', slug)

    // Show 404 if page data isn't found
    if (!page) {
      return this.$nuxt.error({ statusCode: 404, message: 'Page not found' })
    }

    // Set component data
    this.sections = get(page, 'sections', preloadSections)
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
