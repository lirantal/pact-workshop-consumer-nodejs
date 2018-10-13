const Repository = require('../repository')
const ReviewsClient = require('../services/ReviewsClient')

class MoviesController {
  static async get(req, res) {
    try {
      const title = req.query.title || ''
      const moviesCollection = Repository.findBy('title', title)

      if (moviesCollection.size <= 0) {
        return res.status(404).end()
      }

      const movieIds = [...moviesCollection.keys()]
      const reviewsSummary = await ReviewsClient.getMovieReviews(movieIds)

      reviewsSummary.forEach(movieReview => {
        const movie = moviesCollection.get(movieReview.id)
        if (movie) {
          moviesCollection.set(movieReview.id,
            { ...movie, totalReviews: movieReview.total, averageRating: movieReview.averageRating })
        }
      })

      return res.status(200).json([...moviesCollection.values()])

    } catch (err) {
      return res.status(500).end()
    }
  }
}

module.exports = MoviesController