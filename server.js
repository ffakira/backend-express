'use strict'

require('dotenv').config()

const express = require('express')
const session = require('express-session')
const PgSession = require('express-pg-session')(session)
const schema = require('./schema/schema')
const { registerServices } = require('./utils')
const cors = require('cors')
const { graphqlHTTP } = require('express-graphql')
const app = express()

/** @dev config file */
const { Pool } = require('pg')
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
})

const columnNames = {
  session_id: 'sid',
  session_data: 'sess',
  expire: 'expires_at'
}

app.use(session({
  store: new PgSession({
    pool,
    tableName: 'user_session_table',
    columns: columnNames
  }),
  secret: process.env.COOKIE_SESSION,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
  }
}))

/** @dev register graphql middleware */
app.use(
  '/graphql',
  graphqlHTTP({
    // eslint-disable-next-line no-unneeded-ternary
    graphiql: process.env.NODE_ENV === 'development' ? true : false,
    schema
  })
)

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

/** @dev register services */
registerServices(app, pool)

/** @dev start server */
const PORT = process.env.PORT || 4000
const server = app.listen(PORT, () => console.log('[console] Listening to port:', PORT))

/** @dev gracefully shutdown server */
process.on('SIGINT', () => {
  console.log('\n[console] Requested close server on port:', PORT)

  server.close(async () => {
    console.log('[console] Closing server on port:', PORT)
    try {
      await pool.end()
      console.log('[console] Successfully closed pool connections from postgres')
      console.log('[console] Successfully closed port:', PORT)
      process.exit(0)
    } catch (err) {
      console.error('[console] Error occured closing postgres:', err.message)
      process.exit(1)
    }
  })
})
