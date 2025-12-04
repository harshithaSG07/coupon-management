const { createCoupon, findBestCoupon } = require("../services/couponService");

exports.createCouponHandler = (req, res) => {
  const result = createCoupon(req.body);

  if (result.error) {
    return res.status(400).json({ error: result.error });
  }

  return res.status(200).json({
    message: "Coupon created successfully",
    coupon: result,
  });
};

exports.getBestCouponHandler = (req, res) => {
  const { userContext, cart } = req.body;

  if (!userContext || !cart) {
    return res.status(400).json({ error: "Missing userContext or cart" });
  }

  const best = findBestCoupon(userContext, cart);

  if (!best) {
    return res.json({ coupon: null, discount: 0 });
  }

  res.json({
    coupon: best.coupon,
    discount: best.discount,
  });
};
