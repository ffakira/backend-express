import { Router, Request, Response } from 'express'
import { verifyPassword, hashPassword } from '../utils'
import dayjs from 'dayjs'
import dayjsPluginUTC from 'dayjs-plugin-utc'
import UserSchema from '../models/User'

dayjs.extend(dayjsPluginUTC)
const router = Router()

router.get('/logout', async (req: Request, res: Response) => {
  req.session.destroy((err: Error) => {
    console.error('[console]:', err.message)
  })
  res.redirect('/')
})

/** @TODO register not properly working */
router.post('/register', async (req: Request, res: Response) => {
  const { username, password, email } = req.body
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
    const findUser = await UserSchema.findOne(
      { $or: [{ username }, { email }] },
      { username: 1, email: 1 }
    )
    if (!findUser) {
      req.session.errorMessage = JSON.stringify({
        error: {
          username: 'Username already in use',
          email: 'Email already in use',
          data: { username, email }
        }
      })
      res.redirect('/register')
      return
    }
    const hash = await hashPassword(password)
    const user = await new UserSchema({
      username,
      password: hash,
      email
    })
    await user.save()
    res.redirect('/')
  } catch (err) {
    console.error(err)
    res.redirect('/register')
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
    res.redirect('/login')
  }
})

export default router
