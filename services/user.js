const { resError, hashPassword } = require('../utils')

module.exports = (app, client) => {
  app.get('/user/:id', async (req, res) => {
    const query = 'SELECT * FROM user_table WHERE id = $1 LIMIT 1'

    try {
      const resp = await client.query(query, [req.params.id])
      if (resp.rowCount === 0) {
        res.status(204).json({ status: 204, message: 'USER ID not found' })
      } else {
        res.status(200).json({
          status: 200,
          data: resp.rows[0]
        })
      }
    } catch (err) {
      resError(res, err)
    }
  })

  app.post('/user/create', async (req, res) => {
    const { username, password } = req.body
    const query = 'INSERT INTO user_table (username, password) VALUES ($1, $2)'
    try {
      const hash = await hashPassword(password)
      const values = [username, hash]
      await client.query(query, values)
      console.log('[console] new user inserted')
      res.status(201).json({
        status: 201,
        data: {
          username
        }
      })
    } catch (err) {
      resError(res, err)
    }
  })
}
