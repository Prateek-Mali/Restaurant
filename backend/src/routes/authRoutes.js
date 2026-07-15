const express = require('express');
const {
  login,
  registerStaff,
  getMe,
  getAllStaff,
  toggleStaffActive,
  deleteStaff,
} = require('../controllers/authController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/login', login);
router.get('/me', protect, getMe);

router.post('/register', protect, restrictTo('admin'), registerStaff);
router.get('/staff', protect, restrictTo('admin'), getAllStaff);
router.patch('/staff/:id/toggle-active', protect, restrictTo('admin'), toggleStaffActive);
router.delete('/staff/:id', protect, restrictTo('admin'), deleteStaff);

module.exports = router;
