const express = require('express')
const router = express.Router()

const MoviesController = require('../controllers/MoviesController')

router.get('/', MoviesController.get)

module.exports = router
