'use strict'

const bcrypt = require('bcrypt')
const path = require('path')
const fs = require('fs')

/**
 * @dev status code 500 in json format
 * ```json
 * {
 *   "status": 500,
 *   "message": "custom error message"
 * }
 * ```
 * @param {Express.Response} res Express.Response object expected
 * @param {Error} err
 * @returns {void}
 */
function resError (res, err) {
  console.error('[error]:', err)
  res.status(500).json({
    status: 500,
    message: err.message
  })
}

/**
 * @dev status code 200 in json format
 * ```json
 * {
 *   "status": 200,
 *   "data": []
 * }
 * ```
 * @param {Express.Response} res Express.Response object expected
 * @returns {void}
 */
function resNoRows (res) {
  res.status(200).json({
    status: 200,
    data: []
  })
}

/**
 * @param {string} plainPassword
 * @returns {Promise.<string>} hashed password from bcrypt
 */
async function hashPassword (plainPassword) {
  if (plainPassword.length < 8) {
    throw Error('Error: password length cannot be less than 8 characters')
  }
  try {
    const hashPassword = await bcrypt.hash(plainPassword, +process.env.SALT_ROUNDS)
    return hashPassword
  } catch (err) {
    console.error('[console] an error occured:', err.message)
    throw Error(err)
  }
}

/**
 * @dev Utility function to verify password
 * @param {string} password plain text password
 * @param {string} encrypted an encrypted password coming from db
 * @returns {Promise.<boolean>} promise boolean if a password matches
 */
async function verifyPassword (password, encrypted) {
  const isMatch = await bcrypt.compare(password, encrypted)
  try {
    if (isMatch) return true
    return false
  } catch (err) {
    console.error('[console] an error occured:', err.message)
    return false
  }
}

/**
 * @dev automatically register services folder
 * @param {Express} app
 * @returns {void}
 */
function registerServices (app) {
  const servicePath = path.resolve(__dirname, '../services')
  const files = fs.readdirSync(servicePath)
  for (const file of files) {
    const { router, name } = require(`${servicePath}/${file}`)
    app.use(name, router)
  }
}

module.exports = {
  resError,
  resNoRows,
  hashPassword,
  verifyPassword,
  registerServices
}
