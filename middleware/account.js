// eslint-disable-next-line no-unused-vars
const { Request, Response, NextFunction } = require('express')
const { currentTimestamp } = require('../utils')

/**
 * @param {Request} req express.Request
 * @param {Response} res express.Response
 * @param {NextFunction} next express.NextFunction
 */
function auth (req, res, next) {
  if (req.session.isAuth) next()
  else res.status(403).json({ status: 403, message: 'Forbidden' })
}

/**
 * @param {Request} req express.Request
 * @param {Response} res express.Response
 * @param {NextFunction} next express.NextFunction
 */
function timeoutAccount (req, res, next) {
  const { attemptAccessTime } = req.session
  const timeDiff = typeof attemtAccessTime === 'undefined'
    ? undefined
    : attemptAccessTime - currentTimestamp()

  if (timeDiff <= 0 || !req.session.attemptAccessTime) {
    next()
  } else {
    res.status(403).json({
      status: 403,
      message: `Timeout for ${timeDiff} seconds`
    })
  }
}

/**
 * @param {Request} req express.Request
 * @param {Response} res express.Response
 */
function passwordAttempts (req, res) {
  req.session.isAuth = false
  const { attemptAccessTime, passwordAttempts } = req.session
  const timeDiff = req.session.attemptAccessTime - currentTimestamp()

  if (typeof passwordAttempts === 'undefined' && typeof attemptAccessTime === 'undefined') {
    req.session.passwordAttempts = 1
    req.session.attemptAccessTime = currentTimestamp()
  } else {
    const timeDiff = req.session.attemptAccessTime - currentTimestamp()
    if (timeDiff <= 0) {
      req.session.passwordAttempts++

      if (passwordAttempts <= 5) {
        req.session.attemptAccessTime = currentTimestamp() + 60 * 10 // 10 mins
      } else if (passwordAttempts > 5 && passwordAttempts <= 7) {
        req.session.attemptAccessTime = currentTimestamp() + 60 * 30 // 30 mins
      } else if (passwordAttempts > 7) {
        res.status(403).json({ status: 403, message: 'Account have been locked' })
      }
    }
  }
  res.status(403).json({ status: 403, message: `${timeDiff} seconds left` })
}

module.exports = {
  auth,
  timeoutAccount,
  passwordAttempts
}
