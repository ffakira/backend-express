import { Router, Request, Response } from 'express'
import { getReasonPhrase, StatusCodes } from 'http-status-codes'
import { createUser, getUser, IUser } from '../db/user'
import { User } from '../types/custom'
import { verifyPassword } from '../utils'

declare module 'express-session' {
  interface SessionData {
    isAuth?: boolean
    username?: string
    attemptAccessTime?: null | number
    passwordAttempts?: null | number
  }
}

const router = Router()

router.post('/register', async (req: Request, res: Response<User>) => {
  const { username, password } = req.body
  if (!username || !password) {
    res.status(StatusCodes.BAD_REQUEST).json({
      status: StatusCodes.BAD_REQUEST,
      msg: getReasonPhrase(StatusCodes.BAD_REQUEST)
    })
  }
  res.status(StatusCodes.CREATED).json({
    status: StatusCodes.CREATED,
    data: { username }
  })

  /** @TODO implement the remaining function */
  // try {
  //   await createUser(username, password)
  //   res.status(StatusCodes.CREATED).json({
  //     status: StatusCodes.CREATED,
  //     data: { username }
  //   })
  // } catch (err) {
  //   if (err instanceof Error) {
  //     if (err.message.includes('duplicate key value')) {
  //       res.status(StatusCodes.CONFLICT).json({
  //         status: StatusCodes.CONFLICT,
  //         msg: getReasonPhrase(StatusCodes.CONFLICT)
  //       })
  //     }
  //   }
  //   res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
  //     status: StatusCodes.INTERNAL_SERVER_ERROR,
  //     msg: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR)
  //   })
  // }
})

router.post('/login', async (req: Request, res: Response) => {
  const { username, password } = req.body
  if (!username || !password) {
    res.status(StatusCodes.BAD_REQUEST).json({
      status: StatusCodes.BAD_REQUEST,
      msg: getReasonPhrase(StatusCodes.BAD_REQUEST)
    })
  }

  try {
    const resp = (await getUser(username)) as IUser
    const isPassword = await verifyPassword(password, resp.password)

    if (isPassword) {
      req.session.isAuth = true
      req.session.username = username

      res.status(StatusCodes.OK).json({
        status: StatusCodes.OK,
        username
      })
    }
  } catch (err) {
    if (err instanceof Error) {
      if (err.message.includes('No Rows')) {
        res.status(StatusCodes.NO_CONTENT).json({
          status: StatusCodes.NO_CONTENT,
          msg: getReasonPhrase(StatusCodes.NO_CONTENT)
        })
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

export default router
