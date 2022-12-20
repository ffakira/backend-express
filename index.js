'use strict'

require('dotenv').config()

const express = require('express')
const session = require('express-session')
const morgan = require('morgan')
const PgSession = require('./utils/store')(session)
const schema = require('./schema/schema')
const { registerServices } = require('./utils')
const cors = require('cors')
const { graphqlHTTP } = require('express-graphql')
const app = express()
const { NODE_ENV } = process.env

app.disable('x-powered-by')

/** @dev session middleware */
const ONE_DAY = 24 * 60 * 60 * 1000
app.use(session({
  store: new PgSession(),
  secret: process.env.COOKIE_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: ONE_DAY, // 1 day
    httpOnly: true
  }
}))

/** @dev register graphql middleware */
app.use(
  '/graphql',
  graphqlHTTP({
    // eslint-disable-next-line no-unneeded-ternary
    graphiql: NODE_ENV === 'development' ? true : false,
    schema
  })
)

/** @dev additional middlewares */
const morganEnv = NODE_ENV === 'development' ? 'dev' : 'combined'
app.use(morgan(morganEnv))

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

/** @dev register services */
registerServices(app)

module.exports = app
