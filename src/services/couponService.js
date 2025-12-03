// In-memory store
const { parseISO, isBefore, isAfter } = require('date-fns');
const { isCouponEligible } = require('../utils/eligibility');
const { calculateDiscount } = require('../utils/discount');

// In-memory store

const coupons = [];

function createCoupon(data) {
  // Validate required fields
  if (!data.code) {
    return { error: "Coupon code is required" };
  }

  // Check for duplicate coupon code
  const exists = coupons.find(coupon => coupon.code === data.code);
  if (exists) {
    return { error: "Coupon code must be unique" };
  }

  // Build coupon object exactly as required by assignment
  const coupon = {
    code: data.code,
    description: data.description || "",
    discountType: data.discountType,
    discountValue: data.discountValue,
    maxDiscountAmount: data.maxDiscountAmount || null,
    startDate: data.startDate,
    endDate: data.endDate,
    usageLimitPerUser: data.usageLimitPerUser || null,
    eligibility: data.eligibility || {},

    // keep track of user usage
    usagePerUser: {}
  };

  // Save coupon in memory
  coupons.push(coupon);

  return {
    message: "Coupon created successfully",
    coupon
  };
}

function findBestCoupon(userContext, cart) {
  const now = new Date();

  const validCoupons = [];

  for (const coupon of coupons) {

    // 1. Check startDate ≤ now ≤ endDate
    const start = parseISO(coupon.startDate);
    const end = parseISO(coupon.endDate);

    if (isAfter(start, now)) continue; // not started
    if (isBefore(end, now)) continue;  // already ended

    // 2. Check usage limit per user
    if (coupon.usageLimitPerUser !== null) {
      const used = coupon.usagePerUser[userContext.userId] || 0;
      if (used >= coupon.usageLimitPerUser) continue;
    }

    // 3. Check all eligibility rules
    if (!isCouponEligible(coupon, userContext, cart)) {
      continue;
    }

    // 4. Calculate discount
    const discount = calculateDiscount(coupon, cart);
    if (discount <= 0) continue;

    validCoupons.push({ coupon, discount });
  }

  // If no coupons apply
  if (validCoupons.length === 0) {
    return { coupon: null, discount: 0 };
  }

  // Sorting rules:
  validCoupons.sort((a, b) => {
    // 1. Highest discount
    if (b.discount !== a.discount) {
      return b.discount - a.discount;
    }

    // 2. earliest endDate wins
    const endA = parseISO(a.coupon.endDate);
    const endB = parseISO(b.coupon.endDate);
    if (endA.getTime() !== endB.getTime()) {
      return endA - endB;
    }

    // 3. lexicographically smaller code
    return a.coupon.code.localeCompare(b.coupon.code);
  });

  const best = validCoupons[0];
  // Update usage count
  const userId = userContext.userId;
  if (!best.coupon.usagePerUser[userId]) {
    best.coupon.usagePerUser[userId] = 0;
  }
  best.coupon.usagePerUser[userId] += 1;

  return {
    coupon: best.coupon,
    discount: best.discount
  };
}

module.exports = {
  createCoupon,
  findBestCoupon
};
