const moviesDatabase = []

class Repository {
  static insert(object) {
    if (object === null || typeof object !== 'object') {
      return false
    }

    moviesDatabase.push(object)
  }

  static delete(key, value) {
    moviesDatabase = moviesDatabase.filter(object => {
      return (object.hasOwnProperty(key) && object[key] === value) ? false : true
    })
  }

  static findBy(key, value) {
    return moviesDatabase.filter(object => {
      return (object.hasOwnProperty(key) && object[key] === value) ? true : false
    })
  }
}

module.exports = Repository