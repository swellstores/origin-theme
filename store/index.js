import { isCouponValid } from '~/utils/coupon';
import { isGiftCardValid } from '~/utils/giftcards';

export const state = () => ({
  cart: null,
  cartError: null,
  cartIsActive: false,
  cartIsUpdating: false,
  currency: null,
  refetchCurrency: false,
  customer: null,
  customerLoggedIn: false,
  locale: null,
  notification: null,
  cookiesWereAccepted: false,
  headerIsVisible: true,
  headerHeight: 0,
  addedItem: null,
  quickViewIsVisible: false,
  quickViewProductId: null,
  mediaPreviewIsVisible: false,
  mediaPreview: null,
});

export const actions = {
  async selectCurrency({ commit, dispatch }, { code } = {}) {
    try {
      if (code) {
        this.$swell.currency.select(code);
        this.$swell.options.currency = code;
        await this.$swell.settings.refresh();
        commit('setState', { key: 'currency', value: code });
      } else {
        const selected = this.$swell.currency.selected();
        commit('setState', { key: 'currency', value: selected });
      }
    } catch (err) {
      dispatch('handleError', err);
    }
  },

  /**
   * Check if a product is in stock to be added/modified within the cart
   * @property {Object} item - The product or cart item
   * @property {string} id - The cart item id
   * @property {number} quantityToAdd - The quantity to add to cart
   */
  async checkCartItemHasStock({ state }, { item, id }) {
    // Get cart items
    const items = state.cart?.items;

    let cartItem;
    let stockPurchasable;
    let stockTracking;
    let stockLevel;
    let product;
    let currentQuantity = 0;

    const quantityToAdd = item ? item.quantity : 1;

    if (item) {
      product = await this.$swell.products.get(item.productId);
    } else if (id) {
      product = await this.$swell.products.get(id);
    }

    if (!product) throw new Error('Product in cart could not be found.');

    if (items) {
      let variant;
      // If a product item is provided
      if (item) variant = this.$swell.products.variation(product, item.options);
      cartItem = items.find((item) => {
        if (id) {
          return item.id === id;
        } else if (item) {
          return item.variant
            ? item.variantId === variant?.variantId
            : item.productId === variant?.id;
        }
        return null;
      });
    }

    // Get stock availability of cart item
    if (cartItem) {
      stockPurchasable = cartItem.product.stockPurchasable;
      stockTracking = cartItem.product.stockTracking;
      stockLevel = cartItem.product.stockLevel;
      // If variant, get respective stock level
      if (cartItem.variant) {
        stockLevel = cartItem.variant.stockLevel;
      }
      currentQuantity = cartItem.quantity;
    } else {
      // Get stock availability of product to be added
      stockPurchasable = product.stockPurchasable;
      stockTracking = product.stockTracking;
      stockLevel = product.stockLevel;
    }

    // If product is purchasable out of stock or doesn't track stock, allow add to cart
    if (stockPurchasable || !stockTracking) return true;
    if (currentQuantity + quantityToAdd > stockLevel) return false;
    return true;
  },

  /**
   * Product to be added to cart
   * @type {Object} Product
   * @property {string} productId - The product id
   * @property {number} quantity - The quantity to be added
   * @property {array|object} options - The option names and values entered
   */

  /**
   * Adds a product to the cart
   *
   * @param {Product} item Product to add
   */
  async addCartItem({ commit, dispatch, state }, item) {
    // Bail if an update is already in progress
    if (state.cartIsUpdating) return;
    // Set flag to show loading indicator
    commit('setState', { key: 'cartIsUpdating', value: true });

    try {
      // Check if validate stock on add is active
      const validateCartStock = this.$swell.settings.get('cart.validateStock');

      if (validateCartStock) {
        try {
          const cartItemHasStock = await dispatch('checkCartItemHasStock', {
            item,
          });

          if (!cartItemHasStock) {
            commit('setState', { key: 'cartIsUpdating', value: false });
            throw new Error('invalid_stock');
          }
        } catch (err) {
          throw new Error(err.message);
        }
      }

      // Make Swell API call
      const cart = await this.$swell.cart.addItem(item);

      if (cart.errors) {
        dispatch('handleModelErrors', cart.errors);
        commit('setState', { key: 'cartIsUpdating', value: false });
        return;
      }

      // Replace cart state
      commit('setState', { key: 'cart', value: cart });
      // Set item to be displayed in the notification
      commit('setState', { key: 'addedItem', value: item });

      if (state.notification !== null) {
        // If notification is already visible, close it to show new notification
        commit('setState', { key: 'notification', value: null });

        window.setTimeout(() => {
          dispatch('showNotification', {
            message: `Added ${item.quantity} item(s) to cart`,
            type: 'product',
            isSticky: true,
          });
        }, 200);
      } else {
        // Trigger success confirmation
        dispatch('showNotification', {
          message: `Added ${item.quantity} item(s) to cart`,
          type: 'product',
          isSticky: true,
        });
      }
    } catch (err) {
      if (err.message === 'invalid_stock') throw new Error('invalid_stock');
      dispatch('handleError', err);
    }

    // Reset flag to hide loading indicator
    commit('setState', { key: 'cartIsUpdating', value: false });
  },

  /**
   * Removes an item from the cart
   *
   * @param {CartItem} item - Cart item to remove
   */
  async removeCartItem({ commit, dispatch, state }, item) {
    if (state.cartIsUpdating) return;
    commit('setState', { key: 'cartIsUpdating', value: true });

    try {
      const cart = await this.$swell.cart.removeItem(item.id);
      commit('setState', { key: 'cart', value: cart });
      // dispatch('showNotification', { message: 'Removed from cart' })
    } catch (err) {
      dispatch('handleError', err);
    }

    commit('setState', { key: 'cartIsUpdating', value: false });
  },

  /**
   * Updates an item in the cart
   *
   * @param {string} id - Cart item id to update fields of
   * @param {object} fields - Cart item fields to update in key: value format
   */
  async updateCartItem({ commit, dispatch, state }, { id, fieldsToUpdate }) {
    if (state.cartIsUpdating) return;
    commit('setState', { key: 'cartIsUpdating', value: true });

    try {
      const cart = await this.$swell.cart.updateItem(id, fieldsToUpdate);
      commit('setState', { key: 'cart', value: cart });
      // dispatch('showNotification', { message: 'Updated cart' })
    } catch (err) {
      dispatch('handleError', err);
    }

    commit('setState', { key: 'cartIsUpdating', value: false });
  },

  /**
   * Applies a coupon or gift card code to the cart
   *
   * @param {string} code - Coupon or gift card code
   * @returns Error message as a string if the code is invalid
   */
  async applyDiscount({ commit, state }, code) {
    if (state.cartIsUpdating) return;
    commit('setState', { key: 'cartIsUpdating', value: true });
    const defaultError = this.$i18n.t('errors.invalidGiftCard');
    try {
      if (!(isGiftCardValid(code) || isCouponValid(code))) {
        throw new Error(defaultError);
      }
      const cart = await this.$swell.cart.applyCoupon(code);
      commit('setState', { key: 'cart', value: cart });
      // dispatch('showNotification', { message: `Code ${code.toUpperCase()} applied` })
    } catch (err) {
      if (err.message) {
        return err.message;
      } else {
        return defaultError;
      }
    } finally {
      commit('setState', { key: 'cartIsUpdating', value: false });
    }
  },

  /**
   * Removes a coupon or gift card from the cart
   *
   * @param {string} [giftCardId] - ID of gift card already applied to cart
   */
  async removeDiscount({ commit, dispatch, state }, giftCardId) {
    if (state.cartIsUpdating) return;
    commit('setState', { key: 'cartIsUpdating', value: true });

    try {
      let cart;
      if (giftCardId) {
        cart = await this.$swell.cart.removeGiftcard(giftCardId);
        // dispatch('showNotification', { message: `Gift card removed` })
      } else {
        cart = await this.$swell.cart.removeCoupon();
        // dispatch('showNotification', { message: `Coupon removed` })
      }

      commit('setState', { key: 'cart', value: cart });
    } catch (err) {
      dispatch('handleError', err);
    }

    commit('setState', { key: 'cartIsUpdating', value: false });
  },

  async initializeCart({ commit, dispatch, state }, { checkoutId }) {
    let cart = state.cart;

    try {
      if (checkoutId) {
        // Recover cart if checkoutId provided
        cart = await this.$swell.cart.recover(checkoutId);
      } else {
        // Get cart from session (returns null if nothing in cart)
        cart = await this.$swell.cart.get();
      }
      // Update cart state
      commit('setState', { key: 'cart', value: cart });
    } catch (err) {
      dispatch('handleError', err);
    }
  },

  async initializeCustomer({ commit, dispatch }) {
    try {
      const loggedInCustomer = await this.$swell.account.get();

      // Check if customer exists
      if (loggedInCustomer) {
        commit('setState', { key: 'customer', value: loggedInCustomer });
        commit('setState', { key: 'customerLoggedIn', value: true });
      }
    } catch (err) {
      dispatch('handleError', err);
    }
  },

  /**
   * Triggers display of a user notification
   *
   * @param {string} message - Text to be displayed
   * @param {string} type - Type of notification for styling purposes
   * @param {boolean} isSticky - Whether notification requires manually closing
   */
  showNotification(
    { commit, state },
    { message, type = 'confirmation', isSticky = false } = {},
  ) {
    // If non-product notification, set addedItem as null
    if (type !== 'product') {
      commit('setState', { key: 'addedItem', value: null });
    }

    commit('setState', { key: 'notification', value: { message, type } });

    // If sticky setting isn't true, remove the notification after a few seconds
    if (!isSticky) {
      process.client &&
        window.setTimeout(() => {
          commit('setState', { key: 'notification', value: null });
        }, 4000);
    }
  },

  /**
   * Logs the error and triggers an error notification
   *
   * @param {error} error - Error object
   */
  handleError({ dispatch }, error) {
    // Trigger error notification
    dispatch('showNotification', { message: error.message, type: 'error' });
    // Don't log if param is in ignore list
    const ignoreParams = ['coupon_code'];
    if (ignoreParams.includes(error.param)) return;

    if (this.isDev) {
      // Log locally if running in development mode
      console.log(error);
    } else {
      // Otherwise log with reporting tool
      this.$sentry?.captureException(error);
    }
  },

  /**
   * Handles a model error object which is keyed by field
   *
   * @param {error} errors - Model errors object
   */
  handleModelErrors({ dispatch }, errors) {
    if (!errors || typeof errors !== 'object') return;
    // Loop over error keys and handle the first one
    for (const key of Object.keys(errors)) {
      if (errors[key] && errors[key].message) {
        dispatch('handleError', errors[key]);
        return;
      }
    }
  },
};

export const mutations = {
  increment(state, key) {
    state[key]++;
  },
  toggle(state, key) {
    state[key] = !state[key];
  },
  setState(state, { key, value }) {
    state[key] = value;
  },
};
