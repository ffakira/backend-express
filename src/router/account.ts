import { Router, Request, Response } from 'express'
import { getReasonPhrase, StatusCodes } from 'http-status-codes'
import { User } from '../types/custom'
import { verifyPassword, hashPassword } from '../utils'
import { v4 as uuidv4 } from 'uuid'
import dayjs from 'dayjs'
import dayjsPluginUTC from 'dayjs-plugin-utc'
import UserSchema from '../models/User'
import ForgotTokenSchema from '../models/ForgotToken'

dayjs.extend(dayjsPluginUTC)
const router = Router()

router.post('/register', async (req: Request, res: Response<User>) => {
  const { username, password, email } = req.body
  if (!username || !password || !email) {
    res.status(StatusCodes.BAD_REQUEST).json({
      status: StatusCodes.BAD_REQUEST,
      msg: getReasonPhrase(StatusCodes.BAD_REQUEST)
    })
    return
  }

  try {
    const hash = await hashPassword(password)
    const user = await new UserSchema({
      username,
      password: hash,
      email
    })
    await user.save()
    res.status(StatusCodes.CREATED).json({
      status: StatusCodes.CREATED,
      data: { username }
    })
  } catch (err) {
    if (err instanceof Error) {
      console.log(err.message)
      if (err.message.includes('duplicate key error collection')) {
        res.status(StatusCodes.CONFLICT).json({
          status: StatusCodes.CONFLICT,
          msg: 'Email or username already exists'
        })
        return
      }

      if (err.message.includes('buffering timed out')) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          status: StatusCodes.INTERNAL_SERVER_ERROR,
          msg: 'Our database failed :('
        })
        return
      }
    }
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      msg: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR)
    })
  }
})

router.post('/login', async (req: Request, res: Response) => {
  const { username, password } = req.body
  if (!username || !password) {
    res.status(StatusCodes.BAD_REQUEST).json({
      status: StatusCodes.BAD_REQUEST,
      msg: getReasonPhrase(StatusCodes.BAD_REQUEST)
    })
    return
  }

  try {
    const user = await UserSchema.findOne(
      { username },
      { username: 1, password: 1 }
    )
    if (!user) {
      res.status(StatusCodes.NO_CONTENT).json({
        status: StatusCodes.NO_CONTENT,
        msg: 'Invalid username or email'
      })
      return
    } else {
      const isPassword = await verifyPassword(password, user.password)
      if (!isPassword) {
        res.status(StatusCodes.UNAUTHORIZED).json({
          status: StatusCodes.UNAUTHORIZED,
          msg: 'Invalid password'
        })
        return
      }
      res.status(StatusCodes.OK).json({
        status: StatusCodes.OK,
        data: { username }
      })
    }
  } catch (err) {
    if (err instanceof Error) {
      if (err.message.includes('buffering timed out')) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          status: StatusCodes.INTERNAL_SERVER_ERROR,
          msg: 'Our database failed :('
        })
        return
      }
    }
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      msg: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR)
    })
  }
})

router.post('/logout', async (req: Request, res: Response) => {
  req.session.destroy((err) => console.error(err))
  res.clearCookie(process.env.COOKIE_NAME as string)

  res.status(StatusCodes.OK).json({
    status: StatusCodes.OK,
    msg: getReasonPhrase(StatusCodes.OK)
  })
})

router.post('/forgot-password', async (req: Request, res: Response) => {
  const { email } = req.body
  if (!email) {
    res.status(StatusCodes.BAD_REQUEST).json({
      status: StatusCodes.BAD_REQUEST,
      msg: getReasonPhrase(StatusCodes.BAD_REQUEST)
    })
    return
  }

  try {
    const user = await UserSchema.findOne({ email }, { email: 1 })
    if (!user) {
      res.status(StatusCodes.NO_CONTENT).json({
        status: StatusCodes.NO_CONTENT,
        msg: 'Invalid username or email'
      })
      return
    }
    const forgotToken = await new ForgotTokenSchema({
      userId: user._id,
      token: uuidv4()
    })

    /** @TODO implement email service */

    forgotToken.save()
    res.status(StatusCodes.CREATED).json({
      status: StatusCodes.CREATED,
      msg: 'E-mail sent'
    })
  } catch (err) {
    if (err instanceof Error) {
      if (err.message.includes('buffering timed out')) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          status: StatusCodes.INTERNAL_SERVER_ERROR,
          msg: 'Our database failed :('
        })
        return
      }
    }
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      msg: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR)
    })
  }
})

router.post('/change-password', async (req: Request, res: Response) => {
  const { token, password } = req.body
  if (!token || !(token.length === 36) || !password) {
    res.status(StatusCodes.BAD_REQUEST).json({
      status: StatusCodes.BAD_REQUEST,
      msg: getReasonPhrase(StatusCodes.BAD_REQUEST)
    })
    return
  }

  try {
    /** @dev Convert to UTC, as mongodb is saving time in UTC, and subtract 30 mins */
    const forgotToken = await ForgotTokenSchema.findOne({
      token,
      createdAt: {
        $gte: new Date(dayjs().subtract(30, 'minutes').utcOffset(8))
      },
      isUsed: false
    })
    if (forgotToken === null) {
      res.status(StatusCodes.UNAUTHORIZED).json({
        status: StatusCodes.UNAUTHORIZED,
        msg: 'Token been expired or used'
      })
      return
    }

    // Update ForgotToken collection
    await ForgotTokenSchema.updateOne(
      { _id: forgotToken._id },
      { $set: { isUsed: true, updatedAt: new Date() } }
    )

    // Update password
    const hash = await hashPassword(password)
    await UserSchema.updateOne(
      { _id: forgotToken.userId },
      { $set: { password: hash, updatedAt: new Date() } }
    )
    res.status(StatusCodes.OK).json({
      status: StatusCodes.OK,
      msg: 'Password been changed'
    })
  } catch (err) {
    if (err instanceof Error) {
      if (err.message.includes('buffering timed out')) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          status: StatusCodes.INTERNAL_SERVER_ERROR,
          msg: 'Our database failed :('
        })
        return
      }
    }
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      msg: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR)
    })
  }
})

export default router
