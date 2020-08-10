<template>
  <div v-if="sections">
    <div v-for="(section, index) in sections" :key="JSON.stringify(section)">
      <SectionAsyncLoader
        :section="section"
        :collection-index="index"
        :fetch-is-pending="!loaded && $fetchState.pending"
      />
    </div>
  </div>
  <div v-else class="py-32 flex flex-col justify-center items-center md:container">
    <div class="bg-primary-light w-1/2 h-7 mb-2"></div>
    <div class="bg-primary-light w-1/3 h-7 mb-6"></div>
    <div class="bg-primary-light w-3/5 h-2 mb-4"></div>
    <div class="bg-primary-light w-4/5 h-2 mb-8"></div>
    <div class="bg-primary-light w-40 h-10"></div>
  </div>
</template>

<script>
// Helpers
import get from 'lodash/get'
import isEmpty from 'lodash/isEmpty'

export default {
  name: 'StandardPage',

  async fetch() {
    const { $swell, $route } = this
    const slug = $route.params.slug || 'home'

    const page = await $swell.content.get('pages', slug)

    // Show 404 if page data isn't found
    if (!page) {
      return this.$nuxt.error({ statusCode: 404, message: 'Page not found' })
    }

    // Set component data
    const sections = get(page, 'sections')
    this.sections = !isEmpty(sections) ? sections : null
    this.loaded = true
  },

  data() {
    return {
      sections: [],
      loaded: false
    }
  }
}
</script>

<style lang="postcss">
.page-section-move {
  @apply transition-transform duration-500 ease-in-out;
}
</style>
