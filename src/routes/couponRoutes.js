const express = require("express");
const router = express.Router();
const { createCouponHandler, getBestCouponHandler } = require("../controllers/couponController");

router.post("/create", createCouponHandler);
router.post("/best", getBestCouponHandler);

module.exports = router;
