// eslint-disable-next-line no-unused-vars
const { Request, Response, NextFunction } = require('express')

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
 */
function passwordAttempts (req, res) {
  if (!req.session.attemptedTries) req.session.attemptedTries = 1
  else req.session.attemptedTries++

  /** @TODO integrate lock time mechanism */
  if (req.session.attemptedTries < 5) {
    res.status(403).json({
      status: 403,
      message: `Bad Credentials. You can attempt ${5 - req.session.attemptedTries} tries`
    })
  }

  if (req.session.attemptedTries >= 5 && req.session.attemptedTries <= 10) {
    res.status(403).json({ status: 403, message: 'Timeout for 10 mins' })
  }

  if (req.session.attemptedTries > 10) {
    res.status(403).json({ status: 403, message: 'Account have been locked' })
  }
}

module.exports = {
  auth,
  passwordAttempts
}
