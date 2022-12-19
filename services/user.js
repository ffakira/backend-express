'use strict'

const { Router } = require('express')
const { v4: uuidv4 } = require('uuid')
const pool = require('../db')
const { resError, hashPassword, verifyPassword } = require('../utils')
const router = Router()

// router.get('/:id', async (req, res) => {
//   const query = 'SELECT * FROM user_table WHERE id = $1 LIMIT 1'

//   try {
//     const resp = await pool.query(query, [req.params.id])
//     if (resp.rowCount === 0) {
//       res.status(204).json({ status: 204, message: 'USER ID not found' })
//     } else {
//       res.status(200).json({
//         status: 200,
//         data: resp.rows[0]
//       })
//     }
//   } catch (err) {
//     resError(res, err)
//   }
// })

router.post('/register', async (req, res) => {
  const { username, password } = req.body
  const query = 'INSERT INTO user_table (username, password) VALUES ($1, $2)'
  try {
    const hash = await hashPassword(password)
    const values = [username, hash]
    await pool.query(query, values)
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

router.post('/login', async (req, res) => {
  const { username, password } = req.body
  const query = 'SELECT username, password FROM user_table WHERE username=$1 LIMIT 1'
  /** @TODO implement user authentication and session */
  try {
    const resp = await pool.query(query, [username])
    if (resp.rowCount === 0) {
      res.status(204).json({ status: 204, message: 'No username found' })
    } else {
      const isPassword = await verifyPassword(password, resp.rows[0].password)
      if (isPassword) {
        req.session.isAuth = true
        req.session.username = username
        res.status(200).json({ status: 200, message: 'Authenticated.' })
      } else {
        res.status(403).json({ status: 403, message: 'Bad Credentials.' })
      }
    }
  } catch (err) {
    resError(res, err)
  }
})

router.get('/authenticated', async (req, res) => {
  console.log(req.session.isAuth)
  // if (req.session.isAuth) {
  //   res.status(200).json({ status: 200, message: 'Authenticated' })
  // }
  // res.status(401).json({ status: 401, message: 'Forbidden.' })
})

router.post('/logout', async (req, res) => {
  req.session = null
  req.session.destroy()
})

module.exports = {
  router,
  name: '/user'
}
