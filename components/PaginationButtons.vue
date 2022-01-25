<template>
  <div>
    <aside
      v-if="appearance === 'prevNext'"
      class="flex items-center justify-between"
    >
      <NuxtLink
        :tabindex="prevPage ? 0 : -1"
        :class="{ disabled: !prevPage }"
        :to="localePath({ query: { ...$route.query, page: prevPage } })"
        class="btn sm:w-32"
      >
        {{ $t('categories.slug.pagination.previous') }}
      </NuxtLink>
      <div class="text-center">
        {{ $t('categories.slug.pagination.page', { currentPage, pagesCount }) }}
      </div>
      <NuxtLink
        :tabindex="nextPage ? 0 : -1"
        :class="{ disabled: !nextPage }"
        :to="localePath({ query: { ...$route.query, page: nextPage } })"
        class="btn sm:w-32"
      >
        {{ $t('categories.slug.pagination.next') }}
      </NuxtLink>
    </aside>

    <div v-else class="">
      <div class="mb-4 flex justify-center gap-x-2">
        <template v-for="(el, index) in pageButtons">
          <NuxtLink
            v-if="el !== 'break'"
            :key="index"
            :class="{ disabled: currentPage == el }"
            :to="localePath({ query: { page: el } })"
            class="btn h-auto px-3 py-2"
          >
            {{ el }}
          </NuxtLink>

          <span v-if="el === 'break'" :key="index" class="flex items-end">
            &hellip;
          </span>
        </template>
      </div>

      <div class="text-center">
        {{ $t('categories.slug.pagination.page', { currentPage, pagesCount }) }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PaginationButtons',

  props: {
    currentPage: {
      type: Number,
      default: 1,
    },
    pages: {
      type: Object,
      default: () => ({}),
    },
    appearance: {
      type: String,
      default: 'buttons',
      validator: (value) => ['prevNext', 'buttons'].includes(value),
    },
  },

  computed: {
    pageButtons() {
      const pages = [...Array(this.pagesCount).keys()].map((x) => ++x)

      if (this.pagesCount <= 5) return pages

      if (this.currentPage - 2 > 1 && this.currentPage + 2 < pages.length) {
        return [
          pages[0],
          'break',
          ...pages.slice(this.currentPage - 2, this.currentPage + 1),
          'break',
          pages[pages.length - 1],
        ]
      }

      if (this.currentPage - 3 <= 0) {
        return [...pages.slice(0, 4), 'break', pages[pages.length - 1]]
      }

      if (this.currentPage + 3 > pages.length) {
        return [pages[0], 'break', ...pages.slice(-4)]
      }

      return pages
    },
    pagesCount() {
      return Object.keys(this.pages).length
    },
    prevPage() {
      return this.currentPage > 1 ? this.currentPage - 1 : 0
    },
    nextPage() {
      return this.currentPage < this.pagesCount ? this.currentPage + 1 : 0
    },
  },
}
</script>
