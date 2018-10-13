const moviesDatabase = new Map()

class Repository {
  static insert(object) {
    if (object === null || typeof object !== 'object') {
      return false
    }

    if (!object.hasOwnProperty('id')) {
      return false
    }

    moviesDatabase.set(object.id, object)
  }

  static delete(key, value) {
    if (key && !value) {
      moviesDatabase.delete(key)
    }

    if (key && value) {
      moviesDatabase.forEach((object, mapKey) => {
        if (object.hasOwnProperty(key) && object[key] === value) {
          moviesDatabase.delete(mapKey)
        }
      })
    }
  }

  static findBy(key, value) {
    const results = new Map()

    moviesDatabase.forEach((object) => {
      if (object.hasOwnProperty(key) && object[key] === value) {
        results.set(object.id, object)
      }
    })

    return results
  }
}

module.exports = Repository