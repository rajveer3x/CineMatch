const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getPopular, search, getDetails } = require('../controllers/movieController');

router.use(protect);

router.get('/popular', getPopular);
router.get('/search', search);
router.get('/:tmdbId', getDetails);

module.exports = router;
