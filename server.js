require('dotenv').config()

const express = require('express')
const schema = require('./schema/schema')
const cors = require('cors')
const { graphqlHTTP } = require('express-graphql')
const { client, createTable } = require('./services/db')
const app = express()

/** @dev connect to postgres */
client.connect(async (err) => {
  if (err) throw err
  console.log(
    `[console]: Postgres connected to: postgres://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`
  )
  await createTable()
})

/** @dev register middleware */
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
require('./services/song')(app, client)
require('./services/lyric')(app, client)

/** @dev start server */
const PORT = process.env.PORT || 4000
app.listen(PORT, () => {
  console.log('[console]: Listerning to port:', PORT)
})
