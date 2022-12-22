import { hashPassword } from '../utils'
import pool from './posgres'

export async function createUser(username: string, password: string) {
  const query = 'INSERT INTO user_table (username, password) VALUES ($1, $2)'
  const hash = await hashPassword(password)
  const values = [username, hash]
  return await pool.query(query, values)
}

export interface IUser {
  username: string
  password: string
}

export async function getUser(username: string): Promise<IUser | Error> {
  const query =
    'SELECT username, password from user_table WHERE username = $1 LIMIT 1'
  try {
    const resp = await pool.query(query, [username])
    if (resp.rowCount === 0) return new Error('No rows')
    else {
      return {
        username: resp.rows[0].username,
        password: resp.rows[0].password
      }
    }
  } catch (err) {
    if (err instanceof Error) return new Error(err.message)
    return new Error(err as any)
  }
}
