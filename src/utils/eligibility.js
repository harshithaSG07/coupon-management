const { isBefore, isAfter } = require("date-fns");

function isCouponEligible(coupon, user, cartValue, categories, itemsCount, usagePerUser) {
  const now = new Date();
  const e = coupon.eligibility;

  if (isBefore(now, coupon.startDate) || isAfter(now, coupon.endDate)) return false;

  if (e.allowedUserTiers && !e.allowedUserTiers.includes(user.userTier)) return false;
  if (user.lifetimeSpend < e.minLifetimeSpend) return false;
  if (user.ordersPlaced < e.minOrdersPlaced) return false;

  if (e.firstOrderOnly && user.ordersPlaced > 0) return false;

  if (e.allowedCountries && !e.allowedCountries.includes(user.country)) return false;

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

  // Usage-per-user check
  const usedCount = usagePerUser?.[user.userId]?.[coupon.code] || 0;
  if (usedCount >= coupon.usageLimitPerUser) return false;

  return true;
}

module.exports = { isCouponEligible };
