import Vue from 'vue';

export default (context) => {
  const { i18n, $swell, store } = context;
  Vue.filter('formatSubscriptionToLabel', function (option) {
    if (!option) return '';
    const { interval, intervalCount } = option.billingSchedule;
    const intervalLabel = `products._slug.purchaseOptions.interval.${interval}.label`;
    const n = intervalCount > 1 ? intervalCount : undefined;
    return i18n.t('products._slug.purchaseOptions.interval.productsInterval', {
      count: 1,
      n,
      interval: i18n.tc(intervalLabel, intervalCount),
    });
  });

  Vue.filter('formatSubscriptionToPrice', function (option) {
    if (!option) return '';
    const { interval, intervalCount } = option.billingSchedule;
    const subscriptionInterval = i18n.t(
      `products._slug.purchaseOptions.interval.${interval}.short`,
    );
    return `${$swell.currency.format(option.price, {
      code: store.getters.currency,
      convert: false,
    })}/${intervalCount > 1 ? intervalCount : ''}${subscriptionInterval}`;
  });
};
