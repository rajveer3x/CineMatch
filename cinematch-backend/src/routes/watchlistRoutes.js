const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  addToWatchlist,
  getMyWatchlist,
  updateStatus,
  removeFromWatchlist
} = require('../controllers/watchlistController');

router.use(protect);

router.post('/', addToWatchlist);
router.get('/me', getMyWatchlist);
router.patch('/:id', updateStatus);
router.delete('/:id', removeFromWatchlist);

module.exports = router;
