import app from './index'
import pool from './db/posgres'

/** @dev start server */
const PORT = process.env.PORT ?? 4000
const server = app.listen(PORT, () =>
  console.log('[console] Listening to port:', PORT)
)

/** @dev gracefully shutdown server */
process.on('SIGINT', () => {
  console.log('\n[console] Requested close server on port:', PORT)

  server.close(async () => {
    console.log('[console] Closing server on port:', PORT)
    try {
      await pool.end()
      console.log(
        '[console] Successfully closed pool connections from postgres'
      )
      console.log('[console] Successfully closed port:', PORT)
      process.exit(0)
    } catch (err) {
      if (err instanceof Error) {
        console.error('[console] Error occured closing postgres:', err.message)
        process.exit(1)
      }
    }
  })
})

export default server
