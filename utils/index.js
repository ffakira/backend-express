const bcrypt = require('bcrypt')

function resError (res, err) {
  console.error('[error]:', err)
  res.status(500).json({
    status: 500,
    message: err.message
  })
}

function resNoRows (res) {
  res.status(200).json({
    status: 200,
    data: []
  })
}

/**
 * @param {string} plainPassword
 * @returns {string} hashed password from bcrypt
 */
async function hashPassword (plainPassword) {
  if (plainPassword.length < 8) {
    throw Error('Error: password length cannot be less than 8 characters')
  }
  const saltRounds = process.env.SALT_ROUNDS
  try {
    const hashPassword = await bcrypt.hash(plainPassword, saltRounds)
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
 * @returns {boolean} promise boolean if a password matches
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

module.exports = {
  resError,
  resNoRows,
  hashPassword,
  verifyPassword
}
