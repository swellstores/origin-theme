import { isCouponValid } from './coupon';

describe('Coupon Utils', () => {
  describe('#isCouponValid', () => {
    it('should return false if the code is empty', () => {
      expect(isCouponValid('')).toBe(false);
      expect(isCouponValid(null)).toBe(false);
      expect(isCouponValid(undefined)).toBe(false);
      expect(isCouponValid(false)).toBe(false);
    });

    it('should return false if the code contains non-alphanumeric symbols', () => {
      expect(isCouponValid('ab1[23')).toBe(false);
      expect(isCouponValid('{abc')).toBe(false);
      expect(isCouponValid('abc}')).toBe(false);
      expect(isCouponValid('ab%c')).toBe(false);
      expect(isCouponValid('ab c')).toBe(false);
      expect(isCouponValid('$')).toBe(false);
      expect(isCouponValid('{}')).toBe(false);
      expect(isCouponValid('[]')).toBe(false);
    });

    it('should return true if the code is alphanumeric', () => {
      expect(isCouponValid('a')).toBe(true);
      expect(isCouponValid('abcd')).toBe(true);
      expect(isCouponValid('12345')).toBe(true);
      expect(isCouponValid('abc123')).toBe(true);
      expect(isCouponValid('123abc')).toBe(true);
    });
  });
});
