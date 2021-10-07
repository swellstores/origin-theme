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
import camelCase from 'lodash/camelCase'

// Components
import SectionLoader from '~/components/SectionLoader'
import SectionError from '~/components/SectionError'

const capitalCase = (str) =>
  str.charAt(0).toUpperCase() + camelCase(str.slice(1))

export default {
  name: 'SectionAsyncLoader',

  props: {
    section: {
      type: Object,
      default: () => ({}),
      required: true,
    },
    collectionFieldId: {
      type: String,
      default: 'sections',
    },
    collectionIndex: {
      type: Number,
      default: 0,
    },
    fetchIsPending: {
      type: Boolean,
      default: true,
    },
  },

  computed: {
    component() {
      return () => ({
        component: import(
          `./Section${capitalCase(String(this.section.type))}.vue`
        ),
        loading: SectionLoader,
        error: SectionError,
      })
    },
  },
}
</script>
