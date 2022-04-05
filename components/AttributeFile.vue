<template>
  <div
    v-if="attribute"
    class="flex-no-wrap flex border-b border-primary-med py-3"
  >
    <!-- Multiple files -->
    <template v-if="Array.isArray(attribute.value)">
      <strong class="w-1/4 pr-6 text-primary-darkest">{{
        attribute.name
      }}</strong>
      <div>
        <a
          v-for="{ file } in attribute.value"
          :key="file.id"
          :href="file && file.url"
          class="mb-2 flex items-center font-normal last:mb-0"
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
      <strong class="w-1/4 pr-6 text-primary-darkest">{{
        attribute.name
      }}</strong>
      <a
        :href="attribute.value.file && attribute.value.file.url"
        class="flex items-center font-normal"
        target="_blank"
        download
      >
        <BaseIcon
          icon="uil:file-download"
          size="sm"
          class="mr-2 inline-block"
        />
        {{ attribute.value.file && attribute.value.file.filename }}
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
