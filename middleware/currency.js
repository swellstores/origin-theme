export default function ({ store, $swell, isDev }) {
  const refetchCurrency =
    $swell.currency.selected() !== $swell.settings.get('store.currency') &&
    !isDev &&
    process.static;

  store.commit('setState', {
    key: 'refetchCurrency',
    value: refetchCurrency,
  });
}
