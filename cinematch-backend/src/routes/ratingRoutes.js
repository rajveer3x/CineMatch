const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { rateMovie, getUserRatings, deleteRating } = require('../controllers/ratingController');

router.use(protect);

router.post('/', rateMovie);
router.get('/me', getUserRatings);
router.delete('/:id', deleteRating);

module.exports = router;
