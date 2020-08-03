<template>
  <component
    :is="component"
    v-if="component"
    v-bind="section"
    :fetch-is-pending="fetchIsPending"
    :data-sw-path="`${collectionFieldId}.${collectionIndex}`"
  />
  <div v-else :data-sw-path="`${collectionFieldId}.${collectionIndex}`" />
</template>

<script>
// Helpers
import camelCase from 'lodash/camelCase'

export default {
  name: 'SectionAsyncLoader',

  props: {
    section: {
      type: Object,
      default: () => ({})
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
      try {
        if (this.section) {
          const capitalCase = str => str.charAt(0).toUpperCase() + camelCase(str.slice(1))
          return () => import(`~/components/Section${capitalCase(String(this.section.type))}`)
        }
        return
      } catch (err) {
        return 'Error loading ' + this.section.type
      }
    }
  }
}
</script>
