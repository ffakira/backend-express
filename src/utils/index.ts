import bcrypt from 'bcrypt'
export const ONE_DAY = 24 * 60 * 60 * 1000

export const currentTimestamp = (): number => Math.ceil(Date.now() / 1000)

/**
 * @param {string} plainPassword
 * @returns {Promise.<string>} hashed password from bcrypt
 */
export async function hashPassword(
  plainPassword: string
): Promise<string | Error> {
  if (plainPassword.length < 8) {
    throw Error('Error: password length cannot be less than 8 characters')
  }
  try {
    const hashPassword = await bcrypt.hash(
      plainPassword,
      +process.env.SALT_ROUNDS!
    )
    return hashPassword
  } catch (err) {
    if (err instanceof Error) {
      console.error('[console] an error occured:', err.message)
      return Error(err.message)
    }
    return Error(err as any)
  }
}

/**
 * @dev Utility function to verify password
 * @param {string} password plain text password
 * @param {string} encrypted an encrypted password coming from db
 * @returns {Promise.<boolean>} promise boolean if a password matches
 */
export async function verifyPassword(
  password: string,
  encrypted: string
): Promise<boolean> {
  const isMatch = await bcrypt.compare(password, encrypted)
  try {
    if (isMatch) return true
    return false
  } catch (err) {
    if (err instanceof Error) {
      console.error('[console] an error occured:', err.message)
      return false
    }
    return false
  }
}
