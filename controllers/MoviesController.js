const Repository = require('../repository')

class MoviesController {
  static get(req, res) {

    const title = req.query.title || ''
    const moviesCollection = Repository.findBy('title', title)

    if (!moviesCollection.length) {
      return res.status(404).end()
    }

    return res.status(200).json(moviesCollection)
  }
}

module.exports = MoviesController