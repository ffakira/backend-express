const app = require('./index')
const pool = require('./db')

/** @dev start server */
const PORT = process.env.PORT
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
