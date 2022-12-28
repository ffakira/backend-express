import express from 'express'
import accountRouter from './account'

/** @dev dependency injection requiring express.Application */
export default function (app: express.Application) {
  // app.use('/', tempRouter)
  app.use('/account', accountRouter)
}

/**
 * @dev need to export empty object to create a module
 * similar behaviour to `module.exports`
 */
export {}
