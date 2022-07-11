<template>
  <div v-if="sections.length">
    <transition-group name="page-section">
      <div
        v-for="(section, index) in sections"
        :key="`${index}.${section.type}`"
      >
        <SectionAsyncLoader
          v-if="section"
          :section="section"
          :collection-index="index"
          :fetch-is-pending="!loaded && $fetchState.pending"
        />
      </div>
    </transition-group>
  </div>

  <div
    v-else-if="$fetchState.pending"
    class="flex flex-col items-center justify-center py-32 md:container"
  >
    <div class="mb-2 h-7 w-1/2 bg-primary-light" />
    <div class="mb-6 h-7 w-1/3 bg-primary-light" />
    <div class="mb-4 h-2 w-3/5 bg-primary-light" />
    <div class="mb-8 h-2 w-4/5 bg-primary-light" />
    <div class="h-10 w-40 bg-primary-light" />
  </div>

  <SectionUndefined
    v-else
    :heading="`${page ? page.name : 'Standard'} page`"
    description="No sections added"
  />
</template>

<script>
// Helpers
import get from 'lodash/get';
import pageMeta from '~/mixins/pageMeta';
import refetchCurrencyMixin from '~/modules/swell/mixins/refetchCurrency';

export default {
  name: 'StandardPage',
  mixins: [pageMeta, refetchCurrencyMixin],

  data() {
    return {
      page: null,
      sections: [],
      loaded: false,
    };
  },

  async fetch() {
    const { $swell, $route } = this;
    const homePage = await $swell.settings.get('store.homePage');
    const slug = $route.params.slug || homePage || 'home';

    const page = await $swell.content.get('pages', slug);

    // Show 404 if page data isn't found
    if (!page) {
      return this.$nuxt.error({ statusCode: 404 });
    }

    // Set component data
    this.setSections(page);
    this.page = page;
    this.loaded = true;
  },

  methods: {
    // Update individual sections as-needed so there's less flashing and
    // the transition group works without scrolling to the page top
    // TODO remove in Vue 3 because it shouldn't be needed
    setSections(page) {
      const newSections = get(page, 'sections');
      if (!Array.isArray(newSections) || !Array.isArray(this.sections)) return;

      // We don't want to set sections individually if the array lengths are different,
      // because that means we're either on first load, or a section has been deleted
      const sectionCountIsEqual = newSections.length === this.sections.length;

      if (this.$swellEditor && sectionCountIsEqual) {
        newSections.forEach((section, index) => {
          if (
            JSON.stringify(section) !== JSON.stringify(this.sections[index])
          ) {
            // Update section if current data isn't identical
            const cleanSection = { ...section };
            delete cleanSection.$locale; // $locale is not a valid attribute name
            this.$set(this.sections, index, cleanSection);
          }
        });
      } else {
        // Set the quick way since the editor isn't active
        this.sections = newSections;
      }
    },
  },
};
</script>

<style lang="postcss">
.page-section-move {
  @apply transition-transform duration-500 ease-in-out;
}
</style>
