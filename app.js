const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')

const indexRouter = require('./routes/index')
const usersRouter = require('./routes/users')
const moviesRouter = require('./routes/moviesRouter')

if (process.env.DB_SEED) {
  console.log('+ Seeding DB data')
  const Repository = require('./repository')
  const DataSet = require('./data/movies.json')

  DataSet.forEach(movieObject => {
    console.log(`  - ${movieObject.title}`)
    Repository.insert(movieObject)
  })
}

const app = express()

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

app.use('/', indexRouter)
app.use('/users', usersRouter)
app.use('/movies', moviesRouter)

module.exports = app
