import { Router, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import dayjs from 'dayjs'
import dayjsPluginUTC from 'dayjs-plugin-utc'
import { v4 as uuidv4 } from 'uuid'
import { verifyPassword, hashPassword } from '../utils'
import UserSchema from '../models/User'
import TokenSchema from '../models/Token'

dayjs.extend(dayjsPluginUTC)
const router = Router()

router.get('/logout', async (req: Request, res: Response) => {
  req.session.destroy((err: Error) => {
    console.error('[console]:', err.message)
  })
  res.redirect('/')
})

router.post('/register', async (req: Request, res: Response) => {
  const { username, password, email, firstName, lastName } = req.body
  if (!username || !password || !email) {
    req.session.errorMessage = JSON.stringify({
      error: {
        username: 'Missing username field',
        password: 'Missing password field',
        email: 'Missing email field'
      },
      data: { username, email }
    })
    res.redirect('/register')
    return
  }
  req.session.errorMessage = undefined
  try {
    const hash = await hashPassword(password)
    const user = await new UserSchema({
      username,
      firstName,
      lastName,
      password: hash,
      email
    })
    const savedUser = await user.save()
    const token = await new TokenSchema({
      userId: savedUser._id,
      token: uuidv4()
    })
    await token.save()
    req.session.errorMessage = undefined
    res.redirect('/successful')
  } catch (err) {
    if (err instanceof Error) {
      if (err.message.includes('duplicate key error')) {
        req.session.errorMessage = JSON.stringify({
          error: {
            username: {
              username: 'Username already in use',
              email: 'Email already in use',
              data: { username, email }
            }
          }
        })
        res.redirect('/register')
        return
      }
      if (
        err.message.includes('password length cannot be less than 8 characters')
      ) {
        req.session.errorMessage = JSON.stringify({
          error: {
            password: 'Password length too short',
            data: { username, email }
          }
        })
      }
    }
    res.redirect('/register')
    return
  }
})

router.post('/login', async (req: Request, res: Response) => {
  const { username, password } = req.body
  if (!username || !password) {
    req.session.errorMessage = JSON.stringify({
      error: {
        username: 'Missing username field',
        password: 'Missing password field'
      },
      data: { username }
    })
    res.redirect('/login')
    return
  }
  req.session.errorMessage = undefined
  try {
    const user = await UserSchema.findOne(
      { username },
      { username: 1, password: 1 }
    )
    if (!user) {
      req.session.errorMessage = JSON.stringify({
        username: 'Invalid account'
      })
      res.redirect('/login')
      return
    } else {
      const isPassword = await verifyPassword(password, user.password)
      if (!isPassword) {
        req.session.errorMessage = JSON.stringify({
          password: 'Invalid password',
          data: { username }
        })
        res.redirect('/login')
        return
      }
      req.session.errorMessage = undefined
      req.session.username = username
      res.redirect('/dashboard')
    }
  } catch (err) {
    console.error(err)
    res.redirect(StatusCodes.INTERNAL_SERVER_ERROR, '/login')
  }
})

export default router
