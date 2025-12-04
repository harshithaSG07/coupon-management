const { parseISO, isBefore, isAfter } = require('date-fns');

/**
 * In-memory store for coupons.
 * Structure of a coupon:
 * {
 *   code, description, discountType('FLAT'|'PERCENT'), discountValue, maxDiscountAmount (number|null),
 *   startDate (ISO string), endDate (ISO string), usageLimitPerUser (number|null),
 *   eligibility: { allowedUserTiers, minLifetimeSpend, minOrdersPlaced, firstOrderOnly, allowedCountries,
 *                  minCartValue, applicableCategories, excludedCategories, minItemsCount }
 *   usagePerUser: { userId: count }  // internally added
 * }
 */
const coupons = [];

/* -------------------------
   Validation helpers
   ------------------------- */
function isValidDateString(s) {
  if (!s) return false;
  const d = Date.parse(s);
  return !isNaN(d);
}

function validateCreatePayload(data) {
  if (!data) return 'Request body is required';
  if (!data.code || typeof data.code !== 'string') return 'code is required (string)';
  if (!data.discountType || !['FLAT', 'PERCENT'].includes(data.discountType))
    return "discountType is required and must be 'FLAT' or 'PERCENT'";
  if (typeof data.discountValue !== 'number' || data.discountValue <= 0)
    return 'discountValue must be a positive number';
  if (!isValidDateString(data.startDate) || !isValidDateString(data.endDate))
    return 'startDate and endDate must be valid ISO date strings';
  // optional checks - eligibility object present (allow empty)
  if (data.eligibility && typeof data.eligibility !== 'object') return 'eligibility must be an object';
  // maxDiscountAmount for PERCENT should be number if provided
  if (data.discountType === 'PERCENT' && data.maxDiscountAmount != null) {
    if (typeof data.maxDiscountAmount !== 'number' || data.maxDiscountAmount < 0) {
      return 'maxDiscountAmount must be a non-negative number';
    }
  }
  // usageLimitPerUser if provided must be positive integer
  if (data.usageLimitPerUser != null) {
    if (!Number.isInteger(data.usageLimitPerUser) || data.usageLimitPerUser < 1) {
      return 'usageLimitPerUser must be an integer >= 1';
    }
  }
  return null;
}

/* -------------------------
   Core functions
   ------------------------- */

function createCoupon(data) {
  const err = validateCreatePayload(data);
  if (err) return { error: err };

  // Unique code
  const exists = coupons.find((c) => c.code === data.code);
  if (exists) return { error: 'Coupon code must be unique' };

  const coupon = {
    code: data.code,
    description: data.description || '',
    discountType: data.discountType,
    discountValue: data.discountValue,
    maxDiscountAmount: data.maxDiscountAmount != null ? data.maxDiscountAmount : null,
    startDate: data.startDate, // keep ISO string for readability
    endDate: data.endDate,
    usageLimitPerUser: data.usageLimitPerUser != null ? data.usageLimitPerUser : null,
    eligibility: data.eligibility || {},
    usagePerUser: {} // internal tracking: { userId: count }
  };

  coupons.push(coupon);
  return coupon;
}

/* compute cart value and categories */
function computeCartDetails(cart) {
  const items = Array.isArray(cart.items) ? cart.items : [];
  const cartValue = items.reduce((s, it) => {
    const price = Number(it.unitPrice || 0);
    const qty = Number(it.quantity || 0);
    return s + price * qty;
  }, 0);
  const categories = items.map((i) => i.category).filter(Boolean);
  const itemsCount = items.reduce((s, it) => s + (Number(it.quantity) || 0), 0);
  return { cartValue, categories, itemsCount };
}

/* eligibility checks exactly as assignment */
function checkEligibility(coupon, userContext, cart) {
  const e = coupon.eligibility || {};
  const { cartValue, categories, itemsCount } = computeCartDetails(cart);

  // Dates: coupon.startDate <= now <= coupon.endDate
  const now = new Date();
  const start = parseISO(coupon.startDate);
  const end = parseISO(coupon.endDate);
  if (isAfter(start, now)) return false; // not started
  if (isBefore(end, now)) return false; // expired

  // usage per user
  if (coupon.usageLimitPerUser != null) {
    const used = coupon.usagePerUser[userContext.userId] || 0;
    if (used >= coupon.usageLimitPerUser) return false;
  }

  // User-based checks
  if (Array.isArray(e.allowedUserTiers) && e.allowedUserTiers.length > 0) {
    if (!e.allowedUserTiers.includes(userContext.userTier)) return false;
  }

  if (typeof e.minLifetimeSpend === 'number') {
    if ((userContext.lifetimeSpend || 0) < e.minLifetimeSpend) return false;
  }

  if (typeof e.minOrdersPlaced === 'number') {
    if ((userContext.ordersPlaced || 0) < e.minOrdersPlaced) return false;
  }

  if (e.firstOrderOnly === true) {
    if ((userContext.ordersPlaced || 0) !== 0) return false;
  }

  if (Array.isArray(e.allowedCountries) && e.allowedCountries.length > 0) {
    if (!e.allowedCountries.includes(userContext.country)) return false;
  }

  // Cart-based checks
  if (typeof e.minCartValue === 'number') {
    if (cartValue < e.minCartValue) return false;
  }

  if (Array.isArray(e.applicableCategories) && e.applicableCategories.length > 0) {
    // coupon applies only if cart contains at least one applicable category
    const found = categories.some((c) => e.applicableCategories.includes(c));
    if (!found) return false;
  }

  if (Array.isArray(e.excludedCategories) && e.excludedCategories.length > 0) {
    // coupon invalid if any excluded category present
    const conflict = categories.some((c) => e.excludedCategories.includes(c));
    if (conflict) return false;
  }

  if (typeof e.minItemsCount === 'number') {
    if (itemsCount < e.minItemsCount) return false;
  }

  return true;
}

/* discount calc */
function calculateDiscountAmount(coupon, cart) {
  const { cartValue } = computeCartDetails(cart);
  if (coupon.discountType === 'FLAT') {
    return coupon.discountValue;
  }
  if (coupon.discountType === 'PERCENT') {
    let amount = (coupon.discountValue / 100) * cartValue;
    if (coupon.maxDiscountAmount != null) {
      amount = Math.min(amount, coupon.maxDiscountAmount);
    }
    return amount;
  }
  return 0;
}

/* find best coupon: highest discount -> earliest endDate -> lexicographically smaller code */
function findBestCoupon(userContext, cart) {
  // basic validation
  if (!userContext || !cart) return { coupon: null, discount: 0 };

  const candidates = [];

  for (const c of coupons) {
    try {
      if (!checkEligibility(c, userContext, cart)) continue;
      const discount = calculateDiscountAmount(c, cart);
      if (discount <= 0) continue;
      candidates.push({ coupon: c, discount });
    } catch (err) {
      // skip coupon on unexpected errors
      continue;
    }
  }

  if (candidates.length === 0) return { coupon: null, discount: 0 };

  // sort by discount DESC, endDate ASC, code ASC
  candidates.sort((a, b) => {
    if (b.discount !== a.discount) return b.discount - a.discount;
    const aEnd = parseISO(a.coupon.endDate).getTime();
    const bEnd = parseISO(b.coupon.endDate).getTime();
    if (aEnd !== bEnd) return aEnd - bEnd;
    return a.coupon.code.localeCompare(b.coupon.code);
  });

  const best = candidates[0];

  // Update usage count (user used this coupon once)
  const userId = userContext.userId;
  if (!best.coupon.usagePerUser[userId]) best.coupon.usagePerUser[userId] = 0;
  best.coupon.usagePerUser[userId] += 1;

  return { coupon: best.coupon, discount: best.discount };
}

/* helper to expose coupons for debugging/tests (not required but useful) */
function listCoupons() {
  // return clones to avoid accidental mutation by caller
  return coupons.map((c) => ({ ...c }));
}

/* Export */
module.exports = {
  createCoupon,
  findBestCoupon,
  // exports for tests
  _internal: {
    coupons,
    computeCartDetails,
    checkEligibility,
    calculateDiscountAmount,
    listCoupons
  }
};
