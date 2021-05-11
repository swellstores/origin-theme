export const state = () => ({
  cart: null,
  cartError: null,
  cartIsUpdating: false,
  currency: null,
  customer: null,
  customerLoggedIn: false,
  locale: null,
  notification: null,
  cookiesWereAccepted: false,
  headerIsVisible: true,
  headerHeight: 0,
  addedItem: null
})

export const actions = {
  selectCurrency({ commit, dispatch, state }, { code } = {}) {
    try {
      if (code) {
        this.$swell.currency.select(code)
        commit('setState', { key: 'currency', value: code })
      } else {
        const selected = this.$swell.currency.selected()
        commit('setState', { key: 'currency', value: selected })
      }
    } catch (err) {
      dispatch('handleError', err)
    }
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
    if (state.cartIsUpdating) return
    // Set flag to show loading indicator
    commit('setState', { key: 'cartIsUpdating', value: true })

    try {
      // Make Swell API call
      const cart = await this.$swell.cart.addItem(item)
      // Replace cart state
      commit('setState', { key: 'cart', value: cart })
      // Set item to be displayed in the notification
      commit('setState', { key: 'addedItem', value: item })

      if (cart.errors) {
        dispatch('handleError', cart.errors.items)
        commit('setState', { key: 'cartIsUpdating', value: false })
        return
      }

      if (state.notification !== null) {
        // If notification is already visible, close it to show new notification
        commit('setState', { key: 'notification', value: null })

        window.setTimeout(() => {
          dispatch('showNotification', {
            message: `Added ${item.quantity} item(s) to cart`,
            type: 'product',
            isSticky: true
          })
        }, 200)
      } else {
        // Trigger success confirmation
        dispatch('showNotification', {
          message: `Added ${item.quantity} item(s) to cart`,
          type: 'product',
          isSticky: true
        })
      }
    } catch (err) {
      dispatch('handleError', err)
    }

    // Reset flag to hide loading indicator
    commit('setState', { key: 'cartIsUpdating', value: false })
  },

  /**
   * Removes an item from the cart
   *
   * @param {CartItem} item - Cart item to remove
   */
  async removeCartItem({ commit, dispatch, state }, item) {
    if (state.cartIsUpdating) return
    commit('setState', { key: 'cartIsUpdating', value: true })

    try {
      const cart = await this.$swell.cart.removeItem(item.id)
      commit('setState', { key: 'cart', value: cart })
      // dispatch('showNotification', { message: 'Removed from cart' })
    } catch (err) {
      dispatch('handleError', err)
    }

    commit('setState', { key: 'cartIsUpdating', value: false })
  },

  /**
   * Updates an item in the cart
   *
   * @param {string} id - Cart item id to update fields of
   * @param {object} fields - Cart item fields to update in key: value format
   */
  async updateCartItem({ commit, dispatch, state }, { id, fieldsToUpdate }) {
    if (state.cartIsUpdating) return
    commit('setState', { key: 'cartIsUpdating', value: true })

    try {
      const cart = await this.$swell.cart.updateItem(id, fieldsToUpdate)
      commit('setState', { key: 'cart', value: cart })
      // dispatch('showNotification', { message: 'Updated cart' })
    } catch (err) {
      dispatch('handleError', err)
    }

    commit('setState', { key: 'cartIsUpdating', value: false })
  },

  /**
   * Applies a coupon or gift card code to the cart
   *
   * @param {string} code - Coupon or gift card code
   */
  async applyDiscount({ commit, dispatch, state }, code) {
    if (state.cartIsUpdating) return
    commit('setState', { key: 'cartIsUpdating', value: true })
    try {
      const cart = await this.$swell.cart.applyCoupon(code)
      commit('setState', { key: 'cart', value: cart })
      // dispatch('showNotification', { message: `Code ${code.toUpperCase()} applied` })
    } catch (err) {
      dispatch('handleError', err)
    }

    commit('setState', { key: 'cartIsUpdating', value: false })
  },

  /**
   * Removes a coupon or gift card from the cart
   *
   * @param {string} [giftCardId] - ID of gift card already applied to cart
   */
  async removeDiscount({ commit, dispatch, state }, giftCardId) {
    if (state.cartIsUpdating) return
    commit('setState', { key: 'cartIsUpdating', value: true })

    try {
      let cart
      if (giftCardId) {
        cart = await this.$swell.cart.removeGiftcard(giftCardId)
        // dispatch('showNotification', { message: `Gift card removed` })
      } else {
        cart = await this.$swell.cart.removeCoupon()
        // dispatch('showNotification', { message: `Coupon removed` })
      }

      commit('setState', { key: 'cart', value: cart })
    } catch (err) {
      dispatch('handleError', err)
    }

    commit('setState', { key: 'cartIsUpdating', value: false })
  },

  async initializeCart({ commit, dispatch, state }, { checkoutId }) {
    let cart = state.cart

    try {
      if (checkoutId) {
        // Recover cart if checkoutId provided
        cart = await this.$swell.cart.recover(checkoutId)
      } else {
        // Get cart from session (returns null if nothing in cart)
        cart = await this.$swell.cart.get()
      }
      // Update cart state
      commit('setState', { key: 'cart', value: cart })
    } catch (err) {
      dispatch('handleError', err)
    }
  },

  async initializeCustomer({ commit, dispatch }) {
    try {
      const loggedInCustomer = await this.$swell.account.get()

      // Check if customer exists
      if (loggedInCustomer) {
        commit('setState', { key: 'customer', value: loggedInCustomer })
        commit('setState', { key: 'customerLoggedIn', value: true })
      }
    } catch (err) {
      dispatch('handleError', err)
    }
  },

  /**
   * Triggers display of a user notification
   *
   * @param {string} message - Text to be displayed
   * @param {string} type - Type of notification for styling purposes
   * @param {boolean} isSticky - Whether notification requires manually closing
   */
  showNotification({ commit, state }, { message, type = 'confirmation', isSticky = false } = {}) {
    // If non-product notification, set addedItem as null
    if (type !== 'product') {
      commit('setState', { key: 'addedItem', value: null })
    }

    commit('setState', { key: 'notification', value: { message, type } })

    // If sticky setting isn't true, remove the notification after a few seconds
    if (!isSticky) {
      window.setTimeout(() => {
        commit('setState', { key: 'notification', value: null })
      }, 4000)
    }
  },

  /**
   * Logs the error and triggers an error notification
   *
   * @param {error} error - Error object
   */
  handleError({ dispatch }, error) {
    // Trigger error notification
    dispatch('showNotification', { message: error.message, type: 'error' })
    // Don't log if param is in ignore list
    const ignoreParams = ['coupon_code']
    if (ignoreParams.includes(error.param)) return

    if (this.isDev) {
      // Log locally if running in development mode
      console.log(error)
    } else {
      // Otherwise log with reporting tool
      this.$sentry.captureException(error)
    }
  }
}

export const mutations = {
  increment(state, key) {
    state[key]++
  },
  toggle(state, key) {
    state[key] = !state[key]
  },
  setState(state, { key, value }) {
    state[key] = value
  }
}
