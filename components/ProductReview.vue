<template>
  <div class="">
    <p class="text-base/5 font-semibold text-primary-darkest">
      {{ review.name }}
    </p>

    <div class="mt-4 inline-flex items-center gap-1 md:mt-5">
      <div v-for="rate in review.rating" :key="rate" class="">
        <svg
          class=""
          width="18"
          height="17"
          viewBox="0 0 18 17"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            class=""
            fill="#e63360"
            d="M13.2763 16.4275C13.0722 16.4275 12.8692 16.3649 12.6944 16.2401L8.5859 13.2937L4.47736 16.2401C4.30714 16.3626 4.10257 16.4282 3.89287 16.4274C3.68317 16.4267 3.47907 16.3597 3.30969 16.2361C3.14016 16.1132 3.01372 15.9399 2.94834 15.741C2.88296 15.5421 2.88199 15.3276 2.94556 15.128L4.47786 10.1826L0.406191 7.31348C0.237446 7.18894 0.112126 7.01451 0.0479575 6.81484C-0.0162109 6.61518 -0.0159796 6.40039 0.0486187 6.20086C0.113727 6.00182 0.239741 5.82827 0.408852 5.70475C0.577963 5.58122 0.781617 5.51397 0.991033 5.51249L6.03391 5.50491L7.63945 0.682235C7.7057 0.483563 7.83279 0.310771 8.00269 0.188329C8.1726 0.0658865 8.37672 0 8.58615 0C8.79558 0 8.99971 0.0658865 9.16961 0.188329C9.33952 0.310771 9.4666 0.483563 9.53286 0.682235L11.1111 5.50491L16.1798 5.51249C16.3894 5.51367 16.5934 5.58089 16.7627 5.7046C16.9319 5.82831 17.0579 6.00222 17.1227 6.20162C17.1876 6.40102 17.1879 6.61577 17.1237 6.81537C17.0595 7.01496 16.934 7.18925 16.7651 7.31348L12.6934 10.1826L14.2257 15.128C14.2894 15.3275 14.2886 15.542 14.2233 15.7409C14.158 15.9399 14.0316 16.1132 13.8621 16.2361C13.6922 16.3607 13.4869 16.4278 13.2763 16.4275Z"
          />
        </svg>
      </div>
    </div>

    <blockquote class="mt-4 text-sm md:mt-5">"{{ review.quote }}"</blockquote>
  </div>
</template>

<script>
import { dateTimeFormatter } from '~/utils/formatters';

export default {
  name: 'ProductPreview',

  props: {
    review: {
      type: Object,
      default: () => {},
    },
  },
  methods: {
    reviewDate(date) {
      if (!process.client || !date) return;

      return dateTimeFormatter({
        date: new Date(date),
        locale: navigator.language,
        options: {
          year: undefined,
          month: 'long', // Change to 'short' for abbreviated month name
          day: '2-digit',
          hour: undefined,
          minute: undefined,
        },
      });
    },
  },
};
</script>

<style lang="scss" scoped></style>
