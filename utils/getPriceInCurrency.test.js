const { getPriceInCurrency } = require('./getPriceInCurrency');

describe('currency-test', () => {
  it('no prices are specified', () => {
    const product = {
      currency: 'USD',
      options: [],
      price: null,
      purchaseOptions: {
        standard: {
          price: null,
          sale: false,
          salePrice: null,
          $currency: {
            usd: {
              price: null,
              salePrice: null,
            },
            eur: {
              price: null,
              salePrice: null,
            },
          },
        },
      },
      variants: {
        results: [],
      },
    };

    const price1 = getPriceInCurrency(product, 'USD');

    expect(price1).toBeFalsy();

    const price2 = getPriceInCurrency(product, 'EUR');

    expect(price2).toBeFalsy();
  });

  it('standard price in usd only', () => {
    const product = {
      currency: 'USD',
      options: [],
      price: 15,
      purchaseOptions: {
        standard: {
          price: 15,
          sale: false,
          salePrice: 10,
          $currency: {
            usd: {
              price: 15,
              salePrice: 10,
            },
            eur: {
              price: null,
              salePrice: 5,
            },
          },
        },
      },
      variants: {
        results: [],
      },
    };

    const price1 = getPriceInCurrency(product, 'USD');

    expect(price1).toEqual(15);

    const price2 = getPriceInCurrency(product, 'EUR');

    expect(price2).toBeFalsy();
  });

  it('standard price in both currencies', () => {
    const product = {
      currency: 'USD',
      options: [],
      price: 10,
      purchaseOptions: {
        standard: {
          price: 10,
          sale: true,
          salePrice: 10,
          $currency: {
            usd: {
              price: 15,
              salePrice: 10,
            },
            eur: {
              price: 15,
              salePrice: 10,
            },
          },
        },
      },
      variants: {
        results: [],
      },
    };

    const price1 = getPriceInCurrency(product, 'USD');

    expect(price1).toEqual(10);

    const price2 = getPriceInCurrency(product, 'EUR');

    expect(price2).toEqual(10);
  });

  it('options are priced in both currencies and variants are enabled', () => {
    const product = {
      currency: 'USD',
      options: [
        {
          values: [
            {
              name: 'red',
              price: 5,
              $currency: {
                usd: {
                  price: 5,
                },
                eur: {
                  price: 4,
                },
              },
            },
            {
              name: 'blue',
              price: 6,
              $currency: {
                usd: {
                  price: 6,
                },
                eur: {
                  price: 3,
                },
              },
            },
          ],
          name: 'color',
        },
      ],
      price: 0,
      purchaseOptions: {},
      variants: {
        results: [
          {
            currency: 'USD',
            name: 'blue',
            price: 6,
          },
          {
            currency: 'USD',
            name: 'red',
            price: 5,
          },
        ],
      },
    };

    const price1 = getPriceInCurrency(product, 'USD');

    expect(price1).toEqual(5);

    const price2 = getPriceInCurrency(product, 'EUR');

    expect(price2).toEqual(3);
  });

  it('options are priced in both currencies, only one variant is enabled and standard price is enabled', () => {
    const product = {
      currency: 'USD',
      options: [
        {
          values: [
            {
              name: 'red',
              price: 10,
              $currency: {
                usd: {
                  price: 10,
                },
                eur: {
                  price: 5,
                },
              },
            },
            {
              name: 'green',
              price: 7,
              $currency: {
                usd: {
                  price: 7,
                },
                eur: {
                  price: 20,
                },
              },
            },
          ],
          name: 'color',
        },
      ],
      price: 100,
      purchaseOptions: {
        standard: {
          price: 100,
          sale: false,
          salePrice: null,
          $currency: {
            usd: {
              price: 100,
              salePrice: null,
            },
            eur: {
              price: 100,
              salePrice: null,
            },
          },
        },
      },
      variants: {
        results: [
          {
            currency: 'USD',
            name: 'red',
            price: 110,
          },
        ],
      },
    };

    const price1 = getPriceInCurrency(product, 'USD');

    expect(price1).toEqual(110);

    const price2 = getPriceInCurrency(product, 'EUR');

    expect(price2).toEqual(105);
  });

  it('standard price and variants are priced in both currencies', () => {
    const product = {
      currency: 'USD',
      options: [
        {
          values: [
            {
              name: 'red',
            },
            {
              name: 'black',
            },
          ],
          name: 'color',
        },
      ],
      price: 1,
      purchaseOptions: {
        standard: {
          price: 1,
          sale: false,
          salePrice: null,
          $currency: {
            usd: {
              price: 1,
              salePrice: null,
            },
            eur: {
              price: 1,
              salePrice: null,
            },
          },
        },
      },
      variants: {
        results: [
          {
            currency: 'USD',
            name: 'black',
            price: 10,
            purchaseOptions: {
              standard: {
                price: 10,
                sale: false,
                salePrice: null,
                $currency: {
                  usd: {
                    price: 10,
                    salePrice: null,
                  },
                  eur: {
                    price: 12,
                    salePrice: null,
                  },
                },
              },
            },
          },
          {
            currency: 'USD',
            name: 'red',
            price: 11,
            purchaseOptions: {
              standard: {
                price: 11,
                sale: false,
                salePrice: null,
                $currency: {
                  usd: {
                    price: 11,
                    salePrice: null,
                  },
                  eur: {
                    price: 11,
                    salePrice: null,
                  },
                },
              },
            },
          },
        ],
      },
    };

    const price1 = getPriceInCurrency(product, 'USD');

    expect(price1).toEqual(10);

    const price2 = getPriceInCurrency(product, 'EUR');

    expect(price2).toEqual(11);
  });

  it('standard price and variants are priced in both currencies 2', () => {
    const product = {
      currency: 'USD',
      options: [
        {
          values: [
            {
              name: 'red',
            },
            {
              name: 'blue',
            },
          ],
          name: 'color',
        },
      ],
      price: 2,
      purchaseOptions: {
        standard: {
          price: 2,
          sale: false,
          salePrice: 1,
          $currency: {
            usd: {
              price: 2,
              salePrice: 1,
            },
            eur: {
              price: 2,
              salePrice: 1,
            },
          },
        },
      },
      variants: {
        results: [
          {
            currency: 'USD',
            name: 'blue',
            price: 15,
            purchaseOptions: {
              standard: {
                price: 15,
                sale: false,
                salePrice: 10,
                $currency: {
                  usd: {
                    price: 15,
                    salePrice: 10,
                  },
                  eur: {
                    price: 15,
                    salePrice: 10,
                  },
                },
              },
            },
          },
          {
            currency: 'USD',
            name: 'red',
            price: 14,
            purchaseOptions: {
              standard: {
                price: 14,
                sale: false,
                salePrice: 10,
                $currency: {
                  usd: {
                    price: 14,
                    salePrice: 10,
                  },
                  eur: {
                    price: 14,
                    salePrice: 10,
                  },
                },
              },
            },
          },
        ],
      },
    };

    const price1 = getPriceInCurrency(product, 'USD');

    expect(price1).toEqual(14);

    const price2 = getPriceInCurrency(product, 'EUR');

    expect(price2).toEqual(14);
  });

  it('standard price and variants are priced in both currencies, sale is enabled', () => {
    const product = {
      currency: 'USD',
      options: [
        {
          name: 'color',
          values: [
            {
              name: 'red',
            },
            {
              name: 'blue',
            },
          ],
        },
      ],
      price: 1,
      purchaseOptions: {
        standard: {
          price: 1,
          sale: true,
          salePrice: 1,
          $currency: {
            usd: {
              price: 5,
              salePrice: 1,
            },
            eur: {
              price: 5,
              salePrice: 1,
            },
          },
        },
      },
      variants: {
        results: [
          {
            currency: 'USD',
            name: 'blue',
            price: 20,
            purchaseOptions: {
              standard: {
                price: 20,
                sale: true,
                salePrice: 20,
                $currency: {
                  usd: {
                    price: 40,
                    salePrice: 20,
                  },
                  eur: {
                    price: 40,
                    salePrice: 20,
                  },
                },
              },
            },
          },
          {
            currency: 'USD',
            name: 'red',
            price: 15,
            purchaseOptions: {
              standard: {
                price: 15,
                sale: true,
                salePrice: 15,
                $currency: {
                  usd: {
                    price: 30,
                    salePrice: 15,
                  },
                  eur: {
                    price: 30,
                    salePrice: 13,
                  },
                },
              },
            },
          },
        ],
      },
    };

    const price1 = getPriceInCurrency(product, 'USD');

    expect(price1).toEqual(15);

    const price2 = getPriceInCurrency(product, 'EUR');

    expect(price2).toEqual(13);
  });

  it('no price data', () => {
    const product = {
      options: [],
      purchaseOptions: {},
      variants: {
        results: [],
      },
    };

    const price1 = getPriceInCurrency(product, 'USD');

    expect(price1).toBeFalsy();

    const price2 = getPriceInCurrency(product, 'EUR');

    expect(price2).toBeFalsy();
  });

  it('standard price is disabled, root level price is used for variants pricing', () => {
    const product = {
      currency: 'USD',
      options: [
        {
          values: [
            {
              name: 'red',
              price: 40,
              $currency: {
                usd: {
                  price: 40,
                },
                eur: {
                  price: null,
                },
              },
            },
            {
              $currency: {
                usd: {
                  price: null,
                },
                eur: {
                  price: 31,
                },
              },
            },
          ],
          name: 'color',
        },
      ],
      price: 100,
      purchaseOptions: {},
      variants: {
        results: [
          {
            currency: 'USD',
            name: 'blue',
            price: 100,
          },
          {
            currency: 'USD',
            name: 'red',
            price: 140,
          },
        ],
      },
      $currency: {
        USD: {
          price: 100,
          sale_price: 51,
        },
        EUR: {
          price: 200,
          sale_price: 25,
        },
      },
    };

    const price1 = getPriceInCurrency(product, 'USD');

    expect(price1).toEqual(100);

    const price2 = getPriceInCurrency(product, 'EUR');

    expect(price2).toEqual(200);
  });

  it('disabled variants, sale is enabled, used standard price', () => {
    const product = {
      currency: 'USD',
      options: [
        {
          values: [
            {
              name: 'red',
              price: 5,
              $currency: {
                usd: {
                  price: 5,
                },
                eur: {
                  price: 5,
                },
              },
            },
            {
              name: 'black',
              price: 3,
              $currency: {
                usd: {
                  price: 3,
                },
                eur: {
                  price: 7,
                },
              },
            },
          ],
          name: 'color',
        },
      ],
      price: 30,
      purchaseOptions: {
        standard: {
          price: 30,
          sale: true,
          salePrice: 30,
          $currency: {
            usd: {
              price: 40,
              salePrice: 30,
            },
            eur: {
              price: 40,
              salePrice: 30,
            },
          },
        },
      },
      variants: {
        results: [],
      },
    };

    const price1 = getPriceInCurrency(product, 'USD');

    expect(price1).toEqual(30);

    const price2 = getPriceInCurrency(product, 'EUR');

    expect(price2).toEqual(30);
  });

  it('one variant, sale is on, used added price (option price + standard price)', () => {
    const product = {
      currency: 'USD',
      options: [
        {
          values: [
            {
              name: 'red',
              price: null,
              $currency: {
                usd: {
                  price: null,
                },
                eur: {
                  price: 10,
                },
              },
            },
          ],
          name: 'color',
        },
      ],
      price: 1,
      purchaseOptions: {},
      variants: {
        results: [
          {
            currency: 'USD',
            name: 'red',
            price: 1,
          },
        ],
      },
      sale: true,
      $currency: {
        USD: {
          price: 15,
          salePrice: 1,
        },
        EUR: {
          price: 15,
          salePrice: 1,
        },
      },
    };

    const price1 = getPriceInCurrency(product, 'USD');

    expect(price1).toEqual(1);

    const price2 = getPriceInCurrency(product, 'EUR');

    expect(price2).toEqual(11);
  });

  it('product level price in currency', () => {
    const product = {
      currency: 'USD',
      options: [],
      price: 100,
      purchaseOptions: {},
      variants: {
        results: [],
      },
    };

    const price1 = getPriceInCurrency(product, 'USD');

    expect(price1).toEqual(100);

    const price2 = getPriceInCurrency(product, 'EUR');

    expect(price2).toBeFalsy();
  });

  it('variants are not priced, standard price is used', () => {
    const product = {
      currency: 'USD',
      options: [
        {
          name: 'Size',
          values: [{ name: 'small' }, { name: 'medium' }],
        },
      ],
      price: 20,
      purchaseOptions: {
        standard: {
          price: 20,
          sale: false,
          salePrice: null,
          $currency: {
            usd: { price: 20, salePrice: null },
            pln: { price: 80, salePrice: null },
          },
        },
      },
      variants: {
        results: [
          {
            currency: 'USD',
            name: 'medium',
            price: 20,
          },
          {
            currency: 'USD',
            name: 'small',
            price: 20,
          },
        ],
      },
    };

    const price1 = getPriceInCurrency(product, 'USD');

    expect(price1).toEqual(20);

    const price2 = getPriceInCurrency(product, 'PLN');

    expect(price2).toEqual(80);
  });
});
