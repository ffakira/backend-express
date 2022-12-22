import { getReasonPhrase, StatusCodes } from 'http-status-codes'
import { Request, Response, NextFunction } from 'express'
import { currentTimestamp } from '../utils'
import { User } from '../types/custom'

declare module 'express-session' {
  interface SessionData {
    isAuth?: boolean
    attemptAccessTime?: null | number
    passwordAttempts?: null | number
  }
}

/**
 * @param {Request} req express.Request
 * @param {Response} res express.Response
 * @param {NextFunction} next express.NextFunction
 */
function auth(req: Request, res: Response<User>, next: NextFunction): void {
  if (req.session.isAuth) next()
  else
    res.status(StatusCodes.FORBIDDEN).json({
      status: StatusCodes.FORBIDDEN,
      msg: getReasonPhrase(StatusCodes.FORBIDDEN)
    })
}

/**
 * @param {Request} req express.Request
 * @param {Response} res express.Response
 * @param {NextFunction} next express.NextFunction
 */
function timeoutAccount(req: Request, res: Response, next: NextFunction): void {
  const timeDiff = req.session.attemptAccessTime! - currentTimestamp()
  if (currentTimestamp() > req.session.attemptAccessTime!) {
    next()
  } else {
    res.status(StatusCodes.TOO_MANY_REQUESTS).json({
      status: StatusCodes.TOO_MANY_REQUESTS,
      message: `Timeout for ${timeDiff <= 0 ? 0 : timeDiff} seconds`
    })
  }
}

/**
 * @param {Request} req express.Request
 * @param {Response} res express.Response
 */
function passwordAttempts(req: Request, res: Response<User>): void {
  req.session.isAuth = false
  const { attemptAccessTime, passwordAttempts } = req.session
  let timeDiff = req.session.attemptAccessTime! - currentTimestamp()

  /** @dev user's first invalid password */
  if (!passwordAttempts && !attemptAccessTime) {
    req.session.passwordAttempts = 1
    req.session.attemptAccessTime = currentTimestamp()
    timeDiff = req.session.attemptAccessTime - currentTimestamp()
  } else {
    if (currentTimestamp() > req.session.attemptAccessTime!) {
      req.session.passwordAttempts!++

      if (passwordAttempts! <= 5) {
        req.session.attemptAccessTime = currentTimestamp() + 60 * 10 // 10 mins
      } else if (passwordAttempts! > 5 && passwordAttempts! <= 7) {
        req.session.attemptAccessTime = currentTimestamp() + 60 * 30 // 30 mins
      } else if (passwordAttempts! > 7) {
        res
          .status(StatusCodes.LOCKED)
          .json({
            status: StatusCodes.LOCKED,
            msg: getReasonPhrase(StatusCodes.LOCKED)
          })
      }
    }
  }
  res.status(StatusCodes.FORBIDDEN).json({
    status: StatusCodes.FORBIDDEN,
    msg: `${timeDiff <= 0 ? 0 : timeDiff} seconds left`
  })
}

export { auth, timeoutAccount, passwordAttempts }
