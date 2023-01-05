import { StatusCodes } from 'http-status-codes'
import { Request, Response, NextFunction } from 'express'

function auth(req: Request, res: Response, next: NextFunction) {
  if (req.session.username) {
    next()
  } else {
    res.status(StatusCodes.FORBIDDEN).redirect('/login')
  }
}

export default auth
