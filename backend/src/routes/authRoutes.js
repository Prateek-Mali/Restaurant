const express = require('express');
const {
  login,
  registerStaff,
  getMe,
  getAllStaff,
  toggleStaffActive,
  deleteStaff,
} = require('../controllers/authController');
const { protect, restrictTo, optionalAuth } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/login', login);
router.get('/me', protect, getMe);

// Auth handled inside the controller: requires an admin token normally, but
// bootstraps the first admin with no token on an empty database.
router.post('/register', optionalAuth, registerStaff);
router.get('/staff', protect, restrictTo('admin'), getAllStaff);
router.patch('/staff/:id/toggle-active', protect, restrictTo('admin'), toggleStaffActive);
router.delete('/staff/:id', protect, restrictTo('admin'), deleteStaff);

module.exports = router;
