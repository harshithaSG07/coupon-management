function computeCartValue(cart) {
  if (!cart || !Array.isArray(cart.items)) return 0;
  return cart.items.reduce((sum, item) => {
    return sum + item.unitPrice * item.quantity;
  }, 0);
}

function isCouponEligible(coupon, userContext, cart) {
  const e = coupon.eligibility || {};

  // -------------------------
  // USER-BASED CHECKS
  // -------------------------

  // 1. allowedUserTiers
  if (e.allowedUserTiers && e.allowedUserTiers.length > 0) {
    if (!e.allowedUserTiers.includes(userContext.userTier)) {
      return false;
    }
  }

  // 2. minLifetimeSpend
  if (typeof e.minLifetimeSpend === "number") {
    if (userContext.lifetimeSpend < e.minLifetimeSpend) {
      return false;
    }
  }

  // 3. minOrdersPlaced
  if (typeof e.minOrdersPlaced === "number") {
    if (userContext.ordersPlaced < e.minOrdersPlaced) {
      return false;
    }
  }

  // 4. firstOrderOnly
  if (e.firstOrderOnly === true) {
    if (userContext.ordersPlaced !== 0) {
      return false;
    }
  }

  // 5. allowedCountries
  if (e.allowedCountries && e.allowedCountries.length > 0) {
    if (!e.allowedCountries.includes(userContext.country)) {
      return false;
    }
  }

  // -------------------------
  // CART-BASED CHECKS
  // -------------------------

  const cartValue = computeCartValue(cart);
  const categories = cart.items.map(item => item.category);
  const totalItems = cart.items.reduce((sum, i) => sum + i.quantity, 0);

  // 1. minCartValue
  if (typeof e.minCartValue === "number") {
    if (cartValue < e.minCartValue) {
      return false;
    }
  }

  // 2. applicableCategories -> must match AT LEAST ONE
  if (e.applicableCategories && e.applicableCategories.length > 0) {
    const found = categories.some(cat =>
      e.applicableCategories.includes(cat)
    );
    if (!found) return false;
  }

  // 3. excludedCategories -> NONE must match
  if (e.excludedCategories && e.excludedCategories.length > 0) {
    const found = categories.some(cat =>
      e.excludedCategories.includes(cat)
    );
    if (found) return false;
  }

  // 4. minItemsCount
  if (typeof e.minItemsCount === "number") {
    if (totalItems < e.minItemsCount) {
      return false;
    }
  }

  return true; // all checks passed
}

module.exports = {
  isCouponEligible,
  computeCartValue
};
