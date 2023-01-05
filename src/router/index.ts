import express from 'express'
import accountRouter from './account'
import routes from './routes'

/** @dev dependency injection requiring express.Application */
export default function (app: express.Application) {
  app.use('/', routes)
  app.use('/account', accountRouter)
}

/**
 * @dev need to export empty object to create a module
 * similar behaviour to `module.exports`
 */
export {}
