const { hashPassword } = require('../utils')
const pool = require('./index')

async function createUser (username, password) {
  const query = 'INSERT INTO user_table (username, password) VALUES ($1, $2)'
  const hash = await hashPassword(password)
  const values = [username, hash]
  return await pool.query(query, values)
}

async function getUser (username) {
  const query = 'SELECT username, password from user_table WHERE username = $1 LIMIT 1'
  try {
    const resp = await pool.query(query, [username])
    if (resp.rowCount === 0) throw new Error('No rows')
    else {
      return {
        username: resp.rows[0].username,
        password: resp.rows[0].password
      }
    }
  } catch (err) {
    throw new Error(err)
  }
}

module.exports = {
  createUser,
  getUser
}
