const express = require('express');
const {
  createTable,
  getAllTables,
  getTableById,
  resolveTable,
  regenerateQR,
  deleteTable,
} = require('../controllers/tableController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/resolve/:tableId', resolveTable);

router.use(protect, restrictTo('admin'));

router.post('/', createTable);
router.get('/', getAllTables);
router.get('/:id', getTableById);
router.patch('/:id/regenerate-qr', regenerateQR);
router.delete('/:id', deleteTable);

module.exports = router;
