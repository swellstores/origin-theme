<template>
  <aside class="flex justify-between items-center">
    <NuxtLink
      :tabindex="prevPage ? 0 : -1"
      :class="{ disabled: !prevPage }"
      :to="localePath(`?page=${prevPage}`)"
      class="btn sm:w-32"
      >{{ $t('categories._slug.pagination.previous') }}</NuxtLink
    >
    <div class="text-center">
      {{ $t('categories._slug.pagination.page', { currentPage, pagesCount }) }}
    </div>
    <NuxtLink
      :tabindex="nextPage ? 0 : -1"
      :class="{ disabled: !nextPage }"
      :to="localePath(`?page=${nextPage}`)"
      class="btn sm:w-32"
      >{{ $t('categories._slug.pagination.next') }}</NuxtLink
    >
  </aside>
</template>

<script>
export default {
  name: 'PaginationButtons',

  props: {
    currentPage: {
      type: Number,
      default: 1
    },
    pages: {
      type: Object,
      default: () => ({})
    }
  },

  computed: {
    pagesCount() {
      return Object.keys(this.pages).length
    },
    prevPage() {
      return this.currentPage > 1 ? this.currentPage - 1 : null
    },
    nextPage() {
      return this.currentPage < this.pagesCount ? this.currentPage + 1 : null
    }
  }
}
</script>
