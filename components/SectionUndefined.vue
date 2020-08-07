<template>
  <div
    class="my-16 flex flex-col justify-center items-center md:container border-2 border-dashed rounded text-center"
    :class="[
      { 'py-40': !heading && !description },
      { 'py-32': heading || description }
    ]"
  >
    <h3 v-if="heading">{{ heading }}</h3>
    <p v-if="description">{{ description }}</p>
  </div>
</template>

<script>
export default {
  name: 'SectionUndefined',

  props: {
    heading: {
      type: String,
      default: null
    },
    description: {
      type: String,
      default: null
    }
  }
}
</script>
