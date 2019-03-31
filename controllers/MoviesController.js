const Repository = require('../repositories/movies')
const ReviewsClient = require('../utils/ReviewsClient')

class MoviesController {
  static async getAll(req, res) {
    try {
      const movies = Repository.findAll()
      return res.status(200).json([...movies.values()])
    } catch (err) {
      return res.status(500).end(err)
    }
  }

  static async getWithAllStatsWithFilter(req, res) {
    try {
      const title = req.query.title || ''
      const moviesCollection = Repository.findBy('title', title)

      if (moviesCollection.size <= 0) {
        return res.status(404).end()
      }

      const statsSummary = await ReviewsClient.getAllMoviesStatistics()

      statsSummary.forEach(movieStats => {
        const movie = moviesCollection.get(movieStats.id)
        if (movie) {
          moviesCollection.set(movie.id,
            { ...movie, totalReviews: movieStats.totalReviews, averageRating: movieStats.averageRating })
        }
      })

      return res.status(200).json([...moviesCollection.values()])

    } catch (err) {
      return res.status(500).end()
    }
  }

  static async getWithStatsWithFilter(req, res) {
    try {
      const title = req.query.title || ''
      const moviesCollection = Repository.findBy('title', title)

      if (moviesCollection.size <= 0) {
        return res.status(404).end()
      }

      const movieIds = [...moviesCollection.keys()]
      const statsSummary = await ReviewsClient.getMoviesStatistics(movieIds)

      statsSummary.forEach(movieStats => {
        const movie = moviesCollection.get(movieStats.id)
        if (movie) {
          moviesCollection.set(movie.id,
            { ...movie, totalReviews: movieStats.totalReviews, averageRating: movieStats.averageRating })
        }
      })

      return res.status(200).json([...moviesCollection.values()])

    } catch (err) {
      return res.status(500).end()
    }
  }

  static async getWithReviewsWithFilter(req, res) {
    try {
      const title = req.query.title || ''
      const moviesCollection = Repository.findBy('title', title)

      if (moviesCollection.size <= 0) {
        return res.status(404).end()
      }

      const movieIds = [...moviesCollection.keys()]
      const reviewsSummary = await ReviewsClient.getMoviesReviews(movieIds)
      const movieListDTO = new Map(moviesCollection)
      const reviewsMap = {}

      reviewsSummary.forEach(movieReviews => {
        const movie = movieListDTO.get(movieReviews.movieId)
        if (movie) {
          if (reviewsMap[movie.id]) {
            reviewsMap[movie.id][movieReviews.id] =
              {
                headline: movieReviews.headline,
                message: movieReviews.message
              }
          } else {
            reviewsMap[movie.id] = {
              [movieReviews.id]: {
                headline: movieReviews.headline,
                message: movieReviews.message
              }
            }
          }
        }
      })

      for (const [movieId, reviewsObj] of Object.entries(reviewsMap)) {
        const movie = movieListDTO.get(movieId)
        if (movie) {
          movie.reviews = reviewsObj
        }
      }

      return res.status(200).json([...movieListDTO.values()])

    } catch (err) {
      console.error(err)
      return res.status(500).end()
    }
  }
}

module.exports = MoviesController