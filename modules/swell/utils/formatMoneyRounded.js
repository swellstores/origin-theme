/** @type {Map<string, Intl.NumberFormat>} */
const formatters = new Map();

function makeCurrencyFormatter(currency, locale) {
  const locales = [];

  if (locale) {
    locales.push(locale);
  }

  locales.push('en-US');

  return new Intl.NumberFormat(locales, {
    style: 'currency',
    currency,
  });
}

function getFormatterByCurrency(currency, vue) {
  let formatter = formatters.get(currency);

  if (formatter === undefined) {
    const { locale } = vue.$nuxt.$store.$swell.currency;

    formatter = makeCurrencyFormatter(currency, locale);

    formatters.set(currency, formatter);
  }

  return formatter;
}

export function formatMoneyRounded(value, currency = 'USD') {
  return getFormatterByCurrency(currency, this).format(value);
}
