const express = require('express');
const router = express.Router();

const couponController = require('../controllers/couponController');

// API 1 — Create coupon
router.post('/create', couponController.createCoupon);

// API 2 — Best coupon
router.post('/best', couponController.getBestCoupon);

module.exports = router;
