'use strict'

const { Router } = require('express')
const { createUser, getUser } = require('../db/user')
const { auth, passwordAttempts, timeoutAccount } = require('../middleware/account')
const { resError, verifyPassword } = require('../utils')
const router = Router()

router.post('/register', async (req, res) => {
  const { username, password } = req.body
  if (!username || !password) {
    res.status(400).json({ status: 400, message: 'Missing attribute username or password' })
  }

  try {
    await createUser(username, password)
    res.status(201).json({
      status: 201,
      data: { username }
    })
  } catch (err) {
    if (err.message.includes('duplicate key value')) {
      res.status(409).json({
        status: 409,
        message: 'Conflict.'
      })
    }
    resError(res, err)
  }
})

router.post('/login', timeoutAccount, async (req, res) => {
  const { username, password } = req.body
  if (!username || !password) {
    res.status(400).json({ status: 400, message: 'Missing attribute username or password' })
  }

  try {
    const resp = await getUser(username)
    const isPassword = await verifyPassword(password, resp.password)

    if (isPassword) {
      req.session.isAuth = true
      req.session.username = username
      req.session.attemptAccessTime = null
      req.session.attemptedTries = null
      res.status(200).json({ status: 200, message: 'Authenticated.' })
    } else {
      passwordAttempts(req, res)
    }
  } catch (err) {
    if (err.message.includes('No rows')) {
      res.status(204).json({
        status: 204,
        message: 'No username found'
      })
    }
    resError(res, err)
  }
})

router.get('/authenticated', auth, (req, res) => {
  res.status(200).json({ status: 200, message: 'User is authenticated' })
})

/** @dev prevents user from clearing out the session by adding timeoutAccount middleware */
router.post('/logout', timeoutAccount, async (req, res) => {
  req.session.destroy()
  res.clearCookie('connect.sid')
  delete req.session
  res.status(200).json({ status: 200, message: 'Logout.' })
})

module.exports = {
  router,
  name: '/user'
}
