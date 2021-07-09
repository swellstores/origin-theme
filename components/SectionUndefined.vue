<template>
  <div class="m-6 border border-dashed py-32 text-center">
    <h3>{{ heading }}</h3>
    <p>{{ description }}</p>
  </div>
</template>

<script>
export default {
  name: 'SectionUndefined',

  props: {
    heading: {
      type: String,
      default: 'New section',
    },
    description: {
      type: String,
      default: 'No type chosen',
    },
  },
}
</script>
