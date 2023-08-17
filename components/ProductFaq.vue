<template>
  <div>
    <ProductOptionLabel
      :id="generateUuid"
      :name="'Frequently Asked Questions'"
    />

    <div class="space-y-4">
      <InfoAccordion
        v-for="detail in details"
        :key="detail.id"
        :label="detail.label"
        :content="detail.details"
      />
    </div>
  </div>
</template>

<script>
import { v4 as uuidv4 } from 'uuid';
import InfoAccordion from './InfoAccordion.vue';

export default {
  name: 'ProductFaq',
  components: { InfoAccordion },
  props: {
    details: {
      type: Object,
      default: null,
    },
  },

  methods: {
    generateUuid() {
      return uuidv4();
    },
  },
};
</script>
