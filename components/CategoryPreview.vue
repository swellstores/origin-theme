<template>
  <div class="relative block my-6">
    <VisualMedia
      :source="category.images ? category.images[0] : ''"
      aspect-ratio="2:1"
      class="rounded overflow-hidden"
    />
    <!-- Darkening overlay -->
    <div class="absolute w-full h-full inset-0 bg-primary-darkest opacity-25 rounded"></div>
    <div class="container absolute text-center center-xy">
      <NuxtLink :to="resolveUrl({ type: 'category', value: category.slug })">
        <h1 class="text-primary-lightest">{{ category.name }}</h1>
      </NuxtLink>
      <div class="text-lg text-primary-lightest" v-html="category.description"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CategoryPreview',

  props: {
    category: {
      type: Object,
      default: () => ({})
    }
  }
}
</script>
