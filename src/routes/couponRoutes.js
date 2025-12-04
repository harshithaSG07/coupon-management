const express = require('express');
const router = express.Router();
const controller = require('../controllers/couponController');

router.post('/create', controller.createCouponHandler);
router.post('/best', controller.getBestCouponHandler);

module.exports = router;
