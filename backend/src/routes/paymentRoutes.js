const express = require('express');
const { initiatePayment, verifyPayment, getRevenueSummary } = require('../controllers/paymentController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

// Public customer flow
router.post('/initiate', initiatePayment);
router.post('/verify', verifyPayment);

// Admin only
router.get('/revenue', protect, restrictTo('admin'), getRevenueSummary);

module.exports = router;
