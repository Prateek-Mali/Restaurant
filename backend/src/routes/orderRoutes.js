const express = require('express');
const {
  placeOrder,
  getOrdersByTable,
  getKitchenOrders,
  getOpenTabs,
  checkoutTable,
  updateOrderStatus,
  getAllOrders,
} = require('../controllers/orderController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

// Public customer flow
router.post('/', placeOrder);
router.get('/table/:tableId', getOrdersByTable);

// Chef/admin flow
router.get('/kitchen', protect, restrictTo('admin', 'chef'), getKitchenOrders);
router.get('/open-tabs', protect, restrictTo('admin', 'chef'), getOpenTabs);
router.patch('/checkout/:tableId', protect, restrictTo('admin', 'chef'), checkoutTable);
router.patch('/:id/status', protect, restrictTo('admin', 'chef'), updateOrderStatus);

// Admin only
router.get('/', protect, restrictTo('admin'), getAllOrders);

module.exports = router;
