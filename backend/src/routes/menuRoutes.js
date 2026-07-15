const express = require('express');
const {
  getMenu,
  getAllMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleAvailability,
} = require('../controllers/menuController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getMenu);
router.get('/all', protect, restrictTo('admin'), getAllMenuItems);

router.post('/', protect, restrictTo('admin'), createMenuItem);
router.put('/:id', protect, restrictTo('admin'), updateMenuItem);
router.delete('/:id', protect, restrictTo('admin'), deleteMenuItem);
router.patch('/:id/toggle-availability', protect, restrictTo('admin', 'chef'), toggleAvailability);

module.exports = router;
