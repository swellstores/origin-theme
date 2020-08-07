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
import get from 'lodash/get'
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

  // computed: {
  //   component() {
  //     try {
  //       if (section) {
  //         const capitalCase = str => str.charAt(0).toUpperCase() + camelCase(str.slice(1))
  //         return () => import(`~/components/Section${capitalCase(String(section.type))}`)
  //       }
  //       return
  //     } catch (err) {
  //       return 'Error loading ' + section.type
  //     }
  //   }
  // },

  data() {
    return {
      component: null
    }
  },

  created() {
    this.loadSection(this.section)
  },

  watch: {
    section(section, oldSection) {
      // TODO: figure out why this doesn't always work
      // Seems to effect some components by making them not reload content beyond the first 2-5 changes, while others work fine
      if (true || get(section, 'type') !== get(oldSection, 'type')) {
        this.loadSection(section)
      }
    }
  },

  methods: {
    loadSection(section) {
      try {
        if (section) {
          const capitalCase = str => str.charAt(0).toUpperCase() + camelCase(str.slice(1))
          this.component = () => import(`~/components/Section${capitalCase(String(section.type))}`)
        }
        return
      } catch (err) {
        return 'Error loading ' + section.type
      }
    }
  }
}
</script>
