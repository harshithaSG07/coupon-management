function calculateDiscount(coupon, cartValue) {
  if (coupon.discountType === "FLAT") {
    return coupon.discountValue;
  }

  if (coupon.discountType === "PERCENT") {
    let discount = (coupon.discountValue / 100) * cartValue;

    if (coupon.maxDiscount) {
      discount = Math.min(discount, coupon.maxDiscount);
    }

    return discount;
  }

  return 0;
}

module.exports = { calculateDiscount };
