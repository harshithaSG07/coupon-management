const { parseISO, isBefore, isAfter } = require("date-fns");

let coupons = [];
let usagePerUser = {}; // { userId: { couponCode: count } }

// -------------------------
//  VALIDATION
// -------------------------
function validateCouponInput(data) {
  const requiredFields = [
    "code",
    "description",
    "discountType",
    "discountValue",
    "startDate",
    "endDate",
    "eligibility"
  ];

  for (let field of requiredFields) {
    if (!data[field]) {
      return `Missing field: ${field}`;
    }
  }

  if (!["FLAT", "PERCENT"].includes(data.discountType)) {
    return "Invalid discountType. Use 'FLAT' or 'PERCENT'.";
  }

  if (data.discountValue <= 0) {
    return "discountValue must be positive.";
  }

  if (data.discountType === "PERCENT" && data.discountValue > 100) {
    return "Percent discount cannot exceed 100%.";
  }

  if (isNaN(Date.parse(data.startDate)) || isNaN(Date.parse(data.endDate))) {
    return "Invalid startDate or endDate.";
  }

  return null;
}

// -------------------------
//  CREATE COUPON
// -------------------------
function createCoupon(data) {
  const validationError = validateCouponInput(data);
  if (validationError) {
    return { error: validationError };
  }

  const exists = coupons.find(c => c.code === data.code);
  if (exists) {
    return { error: "Coupon code must be unique." };
  }

  const coupon = {
    ...data,
    startDate: parseISO(data.startDate),
    endDate: parseISO(data.endDate),
    createdAt: new Date(),
    usageLimitPerUser: data.usageLimitPerUser || 1,
  };

  coupons.push(coupon);
  return coupon;
}

// -------------------------
//  ELIGIBILITY CHECK
// -------------------------
function isCouponEligible(coupon, user, cartValue, categories, itemsCount) {
  const now = new Date();

  // Date validity
  if (isBefore(now, coupon.startDate) || isAfter(now, coupon.endDate)) {
    return false;
  }

  const e = coupon.eligibility;

  if (e.allowedUserTiers && !e.allowedUserTiers.includes(user.userTier)) {
    return false;
  }

  if (user.lifetimeSpend < e.minLifetimeSpend) return false;
  if (user.ordersPlaced < e.minOrdersPlaced) return false;

  if (e.firstOrderOnly && user.ordersPlaced > 0) return false;

  if (e.allowedCountries && !e.allowedCountries.includes(user.country)) {
    return false;
  }

  if (cartValue < e.minCartValue) return false;

  if (e.applicableCategories?.length > 0) {
    const match = categories.some(cat => e.applicableCategories.includes(cat));
    if (!match) return false;
  }

  if (e.excludedCategories?.length > 0) {
    const conflict = categories.some(cat => e.excludedCategories.includes(cat));
    if (conflict) return false;
  }

  if (itemsCount < e.minItemsCount) return false;

  // Usage limit check
  const usedCount = usagePerUser?.[user.userId]?.[coupon.code] || 0;
  if (usedCount >= coupon.usageLimitPerUser) return false;

  return true;
}

// -------------------------
//  DISCOUNT CALCULATION
// -------------------------
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

// -------------------------
//  FIND BEST COUPON
// -------------------------
function findBestCoupon(userContext, cart) {
  const cartValue = cart.items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );

  const categories = cart.items.map(item => item.category);
  const itemsCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  let best = null;

  for (let c of coupons) {
    if (!isCouponEligible(c, userContext, cartValue, categories, itemsCount)) {
      continue;
    }

    const discount = calculateDiscount(c, cartValue);
    if (discount <= 0) continue;

    if (!best) {
      best = { coupon: c, discount };
    } else {
      if (discount > best.discount) {
        best = { coupon: c, discount };
      } else if (discount === best.discount) {
        if (isBefore(c.endDate, best.coupon.endDate)) {
          best = { coupon: c, discount };
        } else if (
          c.endDate.getTime() === best.coupon.endDate.getTime() &&
          c.code < best.coupon.code
        ) {
          best = { coupon: c, discount };
        }
      }
    }
  }

  if (best) {
    if (!usagePerUser[userContext.userId]) {
      usagePerUser[userContext.userId] = {};
    }
    usagePerUser[userContext.userId][best.coupon.code] =
      (usagePerUser[userContext.userId][best.coupon.code] || 0) + 1;
  }

  return best ? best : null;
}

module.exports = {
  createCoupon,
  findBestCoupon,
};
