const { computeCartValue } = require('./eligibility');

function calculateDiscount(coupon, cart) {
  const cartValue = computeCartValue(cart);

  if (coupon.discountType === "FLAT") {
    return coupon.discountValue;
  }

  if (coupon.discountType === "PERCENT") {
    let discount = (coupon.discountValue / 100) * cartValue;

    if (coupon.maxDiscountAmount) {
      discount = Math.max(0, Math.min(discount, coupon.maxDiscountAmount));
    }

    return discount;
  }

  return 0;
}

module.exports = { calculateDiscount };
