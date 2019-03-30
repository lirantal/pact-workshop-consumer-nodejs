const axios = require('axios')
const config = require('../config/index')

class ReviewsClient {
  static async getMoviesStatistics(movieIds = []) {
    const reviewsSummaryEndpoint = `${config.reviewsServiceBaseURL}/stats`
    try {
      const response = await axios.get(reviewsSummaryEndpoint, {
        params: {
          movieId: [...movieIds]
        },
        responseType: 'json'
      })

      return response.data
    } catch (err) {
      return []
    }
  }

  static async getAllMoviesStatistics() {
    const reviewsSummaryEndpoint = `${config.reviewsServiceBaseURL}/stats`
    try {
      const response = await axios.get(reviewsSummaryEndpoint, {
        responseType: 'json'
      })

      return response.data
    } catch (err) {
      return []
    }
  }

  static async getMoviesReviews(movieIds = []) {
    const reviewsSummaryEndpoint = `${config.reviewsServiceBaseURL}/reviews`
    try {
      const response = await axios.get(reviewsSummaryEndpoint, {
        params: {
          movieId: [...movieIds]
        },
        responseType: 'json'
      })

      return response.data
    } catch (err) {
      return []
    }

  }
}

module.exports = ReviewsClient

