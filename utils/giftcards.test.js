import { isGiftCardValid } from './giftcards';

describe('GiftCards Utils', () => {
  describe('#isGiftCardValid', () => {
    it('should return false if the code is empty', () => {
      expect(isGiftCardValid('')).toBe(false);
      expect(isGiftCardValid(undefined)).toBe(false);
      expect(isGiftCardValid(false)).toBe(false);
    });

    it('should return false if the code contains non-alphanumeric symbols', () => {
      expect(isGiftCardValid('ab1[23')).toBe(false);
      expect(isGiftCardValid('{abc')).toBe(false);
      expect(isGiftCardValid('abc}')).toBe(false);
      expect(isGiftCardValid('ab%c')).toBe(false);
      expect(isGiftCardValid('$')).toBe(false);
      expect(isGiftCardValid('{}')).toBe(false);
      expect(isGiftCardValid('[]')).toBe(false);
    });

    it('should return false if the code has less than 5 characters', () => {
      expect(isGiftCardValid('abcd')).toBe(false);
    });

    it('should return true if the code is alphanumeric 5 or more characters', () => {
      expect(isGiftCardValid('abcde')).toBe(true);
      expect(isGiftCardValid('12345')).toBe(true);
      expect(isGiftCardValid('abc123')).toBe(true);
      expect(isGiftCardValid('123abc')).toBe(true);
    });

    it('the code can include spaces', () => {
      expect(isGiftCardValid('abcd e')).toBe(true);
      expect(isGiftCardValid('1 2345')).toBe(true);
      expect(isGiftCardValid('abc 123')).toBe(true);
      expect(isGiftCardValid('1 2 3 a b c')).toBe(true);
    });
  });
});
