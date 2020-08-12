<template>
  <keep-alive>
    <component
      :is="component"
      v-bind="section"
      :fetch-is-pending="fetchIsPending"
      :data-sw-path="`${collectionFieldId}.${collectionIndex}`"
    />
  </keep-alive>
</template>

<script>
// Helpers
import get from 'lodash/get'
import camelCase from 'lodash/camelCase'

// Components
import SectionLoader from '~/components/SectionLoader'
import SectionError from '~/components/SectionError'

const capitalCase = str => str.charAt(0).toUpperCase() + camelCase(str.slice(1))

export default {
  name: 'SectionAsyncLoader',

  props: {
    section: {
      type: Object,
      default: null
    },
    collectionFieldId: {
      type: String,
      default: 'sections'
    },
    collectionIndex: {
      type: Number,
      default: 0
    },
    fetchIsPending: {
      type: Boolean,
      default: true
    }
  },

  computed: {
    component() {
      if (!this.section) return

      return () => ({
        component: import(`~/components/Section${capitalCase(String(this.section.type))}`),
        loading: SectionLoader,
        error: SectionError
      })
    }
  }
}
</script>
