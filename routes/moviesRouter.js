const express = require('express')
const router = express.Router()

const MoviesController = require('../controllers/MoviesController')

router.get('/', MoviesController.getAll)
router.get('/stats', MoviesController.getWithAllStatsWithFilter)
router.get('/reviews', MoviesController.getWithReviewsWithFilter)

module.exports = router
