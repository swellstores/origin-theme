/**
 * Validates that the passed string is a valid gift card code
 *
 * @param {string} giftCard The gift card code to validate
 * @returns {boolean}
 */
export function isGiftCardValid(giftCard) {
  // The gift card code must be an alphanumeric string longer than 5 characters
  return (
    Boolean(giftCard) &&
    /^[A-Za-z0-9 ]+$/.test(giftCard) &&
    giftCard.length >= 5
  );
}
