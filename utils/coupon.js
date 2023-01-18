/**
 * Validates that the passed string is a coupon code
 *
 * @param {string} code
 * @returns {boolean}
 */
export function isCouponValid(code) {
  return Boolean(code) && /^[A-Za-z0-9]+$/.test(code) && code.length > 0;
}
