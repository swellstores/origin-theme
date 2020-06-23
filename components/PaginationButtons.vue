<template>
  <aside class="flex justify-between items-center">
    <NuxtLink
      :tabindex="prevPage ? 0 : -1"
      :class="{ disabled: !prevPage }"
      :to="`?page=${prevPage}`"
      class="btn sm:w-32"
      >Prev<span class="hidden sm:inline">ious</span></NuxtLink
    >
    <div class="text-center">Page {{ currentPage }} of {{ pagesCount }}</div>
    <NuxtLink
      :tabindex="nextPage ? 0 : -1"
      :class="{ disabled: !nextPage }"
      :to="`?page=${nextPage}`"
      class="btn sm:w-32"
      >Next</NuxtLink
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
