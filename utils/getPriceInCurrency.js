import isNumber from 'lodash/isNumber';

export const getPriceInCurrency = (product, currency) => {
  const prices = {
    currency: currency.toLowerCase(),
    variants: new Map(),
    options: new Map(),
  };

  const variants = product.variants ? product.variants.results : [];

  variants.forEach((variant) => {
    const price = getStandardPriceInCurrency(variant, prices.currency);

    prices.variants.set(variant.name, price);
  });

  const standardPrice = getStandardPriceInCurrency(product, prices.currency);
  const productOptions = product.options || [];

  productOptions.forEach((option) => {
    const values = option.values || [];

    values.forEach((value) => {
      const price =
        value.$currency &&
        value.$currency[prices.currency] &&
        value.$currency[prices.currency].price;

      prices.options.set(value.name, price + standardPrice);
    });
  });

  let lowestPrice = Infinity;

  prices.variants.forEach((price, name) => {
    if (!price) {
      const optionPrice = prices.options.get(name);

      if (!optionPrice) {
        lowestPrice = Math.min(standardPrice || Infinity, lowestPrice);
      } else {
        lowestPrice = Math.min(optionPrice, lowestPrice);
      }
    } else {
      lowestPrice = Math.min(prices.variants.get(name), lowestPrice);
    }
  });

  if (prices.variants.size === 0) {
    lowestPrice = Math.min(standardPrice || Infinity, lowestPrice);
  }

  if (lowestPrice < Infinity) {
    return lowestPrice;
  }

  if (product.currency !== currency) {
    return null;
  }

  return 0;
};

export const getStandardPriceInCurrency = (product, currency) => {
  const options = product.purchaseOptions;
  const standard = options && options.standard;
  const standardCurrency = standard && standard.$currency;

  if (standardCurrency) {
    const price = standardCurrency[currency];

    if (price) {
      if (standard.sale && isNumber(standard.salePrice)) {
        return price.salePrice;
      }

      return price.price;
    }
  }

  const productLevelCurrency =
    product.$currency &&
    (product.$currency[currency] || product.$currency[currency.toUpperCase()]);

  if (productLevelCurrency) {
    if (product.sale) {
      return productLevelCurrency.salePrice;
    }

    return productLevelCurrency.price;
  }

  if (product.currency === currency.toUpperCase() && product.price) {
    if (product.sale && isNumber(product.salePrice)) {
      return product.salePrice;
    }

    return product.price;
  }

  return 0;
};
