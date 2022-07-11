export default {
  mounted() {
    const {
      $store: {
        state: { refetchCurrency },
      },
    } = this;

    if (refetchCurrency) {
      this.$fetch();
    }
  },
};
