<template>
  <AccordionItem v-if="attribute" :heading="attribute.name">
    <div class="pb-3" v-html="attribute.value" />
  </AccordionItem>
</template>

<script>
export default {
  props: {
    attribute: {
      type: Object,
      default: () => {},
    },
  },
}
</script>
