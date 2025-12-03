const couponService = require('../services/couponService');

// API 1 — Create Coupon
exports.createCoupon = (req, res) => {
  const result = couponService.createCoupon(req.body);
  return res.json(result);
};

// API 2 — Best Coupon
exports.getBestCoupon = (req, res) => {
  const { userContext, cart } = req.body;
  const result = couponService.findBestCoupon(userContext, cart);
  return res.json(result);
};
