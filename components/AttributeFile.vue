<template>
  <div
    v-if="attribute"
    class="py-3 flex flex-no-wrap border-b border-primary-med"
  >
    <!-- Multiple files -->
    <template v-if="Array.isArray(attribute.value)">
      <strong class="w-1/4 text-primary-darkest pr-6">{{
        attribute.name
      }}</strong>
      <div>
        <a
          v-for="{ file } in attribute.value"
          :key="file.id"
          :href="file.url"
          class="flex items-center font-normal mb-2 last:mb-0"
          download
        >
          <BaseIcon
            icon="uil:file-download"
            size="sm"
            class="mr-2 inline-block"
          />
          {{ file.filename }}
        </a>
      </div>
    </template>

    <!-- Single file -->
    <template v-else>
      <strong class="w-1/4 text-primary-darkest pr-6">{{
        attribute.name
      }}</strong>
      <a
        :href="attribute.value.file.url"
        class="flex items-center font-normal"
        target="_blank"
        download
      >
        <BaseIcon
          icon="uil:file-download"
          size="sm"
          class="mr-2 inline-block"
        />
        {{ attribute.value.file.filename }}
      </a>
    </template>
  </div>
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
