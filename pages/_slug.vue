<template>
  <div v-if="page && page.sections">
    <div v-for="(section, index) in page.sections" :key="JSON.stringify(section)">
      <SectionAsyncLoader
        :section="section"
        :collection-index="index"
        :fetch-is-pending="!loaded && $fetchState.pending"
      />
    </div>
  </div>

  <div
    v-else-if="$fetchState.pending"
    class="py-32 flex flex-col justify-center items-center md:container"
  >
    <div class="bg-primary-light w-1/2 h-7 mb-2"></div>
    <div class="bg-primary-light w-1/3 h-7 mb-6"></div>
    <div class="bg-primary-light w-3/5 h-2 mb-4"></div>
    <div class="bg-primary-light w-4/5 h-2 mb-8"></div>
    <div class="bg-primary-light w-40 h-10"></div>
  </div>

  <SectionUndefined
    v-else
    :heading="`${page ? page.name : 'Standard'} page`"
    description="No sections added"
  />
</template>

<script>
// Helpers
import get from 'lodash/get'
import isEmpty from 'lodash/isEmpty'
import pageMeta from '~/mixins/pageMeta'

export default {
  name: 'StandardPage',
  mixins: [pageMeta],

  async fetch() {
    const { $swell, $route } = this
    const slug = $route.params.slug || 'home'

    const page = await $swell.content.get('pages', slug)

    // Show 404 if page data isn't found
    if (!page) {
      return this.$nuxt.error({ statusCode: 404, message: 'Page not found' })
    }

    // Set component data
    this.page = page
    this.loaded = true
  },

  data() {
    return {
      page: null,
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
