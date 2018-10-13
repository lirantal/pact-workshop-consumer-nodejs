const axios = require('axios')
const config = require('../config/index')

class ReviewsClient {
  static async getMovieReviews(movieIds) {
    const reviewsSummaryEndpoint = `${config.reviewsServiceBaseURL}/reviews`
    const response = await axios.get(reviewsSummaryEndpoint, {
      params: {
        movieId: [...movieIds]
      },
      responseType: 'json'
    })

    return response.data
  }
}

module.exports = ReviewsClient

