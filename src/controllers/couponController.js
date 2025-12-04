const couponService = require('../services/couponService');

exports.createCouponHandler = (req, res) => {
  try {
    const result = couponService.createCoupon(req.body);
    if (result.error) {
      return res.status(400).json({ error: result.error });
    }
    return res.status(201).json({ message: 'Coupon created successfully', coupon: result });
  } catch (err) {
    console.error('createCouponHandler error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getBestCouponHandler = (req, res) => {
  try {
    const { userContext, cart } = req.body;
    if (!userContext || !cart) {
      return res.status(400).json({ error: 'userContext and cart are required in body' });
    }

    const result = couponService.findBestCoupon(userContext, cart);
    if (!result || !result.coupon) {
      return res.json({ coupon: null, discount: 0 });
    }
    return res.json(result);
  } catch (err) {
    console.error('getBestCouponHandler error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
