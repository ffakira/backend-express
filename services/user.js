'use strict'

const { Router } = require('express')
const pool = require('../db')
const { auth, passwordAttempts, timeoutAccount } = require('../middleware/account')
const { resError, hashPassword, verifyPassword } = require('../utils')
const router = Router()

router.post('/register', async (req, res) => {
  const { username, password } = req.body
  if (!username || !password) {
    res.status(400).json({
      status: 400,
      message: 'Missing attribute: username or password'
    })
  } else {
    res.status(201).json({
      status: 201,
      data: {
        username
      }
    })
  }
  // const { username, password } = req.body
  // const query = 'INSERT INTO user_table (username, password) VALUES ($1, $2)'
  // try {
  //   const hash = await hashPassword(password)
  //   const values = [username, hash]
  //   await pool.query(query, values)
  //   console.log('[console] new user inserted')
  //   res.status(201).json({
  //     status: 201,
  //     data: {
  //       username
  //     }
  //   })
  // } catch (err) {
  //   resError(res, err)
  // }
})

router.post('/login', timeoutAccount, async (req, res) => {
  const { username, password } = req.body
  const query = 'SELECT username, password FROM user_table WHERE username=$1 LIMIT 1'

  try {
    const resp = await pool.query(query, [username])
    if (resp.rowCount === 0) {
      res.status(204).json({ status: 204, message: 'No username found' })
    } else {
      const isPassword = await verifyPassword(password, resp.rows[0].password)
      if (isPassword) {
        req.session.isAuth = true
        req.session.username = username
        delete req.session.attemptedTries
        delete req.session.attemptAccessTime
        res.status(200).json({ status: 200, message: 'Authenticated.' })
      } else {
        passwordAttempts(req, res)
      }
    }
  } catch (err) {
    resError(res, err)
  }
})

router.get('/authenticated', auth, (req, res) => {
  res.status(200).json({ status: 200, message: 'User is authenticated' })
})

router.post('/logout', async (req, res) => {
  req.session.destroy()
  res.clearCookie('connect.sid')
  delete req.session
  res.status(200).json({ status: 200, message: 'Logout.' })
})

module.exports = {
  router,
  name: '/user'
}
