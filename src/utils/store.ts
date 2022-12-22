/** @dev Non-customised configuration Postgres store
 * inspired from node-connect-pg-simple package
 * original source: https://github.com/voxpelli/node-connect-pg-simple/blob/main/index.js
 */
import { Session, SessionData, Store } from 'express-session'
import { Pool, QueryResult } from 'pg'
import { EventEmitter } from 'stream'
import pool from '../db/posgres'
import { ONE_DAY, currentTimestamp } from './index'

/**
 * Inspired by util.callbackify()
 *
 * Never throws, even if callback is left out, as that's how it was
 *
 * @template T
 * @param {Promise<T>} value
 * @param {((err: Error|null, result: T) => void)|undefined} cb
 * @returns {void}
 */
const callbackifyPromiseResolution = (value: any, cb?: any): void => {
  if (!cb) value.catch(() => {})
  else {
    value.then(
      (ret: any) => process.nextTick(cb, null, ret),
      (err: any) =>
        process.nextTick(
          cb,
          err || new Error('Promise was rejected with falsy value')
        )
    )
  }
}

type CallbackGet = (err: any, session?: SessionData | null | undefined) => void
type CallbackFunction = ((err?: any) => void) | undefined

/**
 * @typedef PgStoreOptions
 * @property {number} [ttl]
 * @property {Pool} [pool]
 * @property {boolean} [disableTouch]
 */
export default class PgStore extends Store {
  constructor() {
    super()
  }

  private async asyncQuery(query: string, params: any[]) {
    try {
      const resp = await pool.query(query, params)
      return resp && resp.rows && resp.rows[0] ? resp.rows[0] : undefined
    } catch (err) {
      return undefined
    }
  }

  private query(query: string, params: any[], fn: any) {
    let resolveParams

    if (typeof params === 'function') {
      if (fn) throw new Error('Two callback functions set at once')
      fn = params
      resolveParams = []
    } else {
      resolveParams = params || []
    }

    const result = this.asyncQuery(query, resolveParams)
    callbackifyPromiseResolution(result, fn)
  }

  private getExpireTime(sess: SessionData): number {
    let expire
    if (sess && sess.cookie && sess.cookie.expires) {
      const expireDate = new Date(sess.cookie.expires)
      expire = Math.ceil(expireDate.valueOf() / 1000)
    } else {
      expire = Math.ceil(Date.now() / 1000 + ONE_DAY)
    }
    return expire
  }

  get(sid: string, fn: CallbackGet): void {
    const query =
      'SELECT sess FROM session WHERE sid = $1 AND expire >= TO_TIMESTAMP($2)'
    this.query(query, [sid, currentTimestamp()], (err: any, data: any) => {
      if (err) return fn(err)
      if (!data) return fn(null)
      try {
        return fn(
          null,
          typeof data.sess === 'string' ? JSON.parse(data.sess) : data.sess
        )
      } catch {
        return this.destroy(sid, fn)
      }
    })
  }

  set(sid: string, sess: SessionData, fn?: CallbackFunction): void {
    const expireTime = this.getExpireTime(sess)
    const query = `INSERT INTO session (sess, expire, sid) VALUES ($1, TO_TIMESTAMP($2), $3)
    ON CONFLICT (sid) DO UpDATE SET sess=$1`

    this.query(query, [sess, expireTime, sid], (err: any) => {
      fn && fn(err)
    })
  }

  destroy(sid: string, fn?: CallbackFunction): void {
    const query = 'DELETE FROM session WHERE sid = $1'
    this.query(query, [sid], (err: any) => {
      fn && fn(err)
    })
  }

  touch(sid: string, sess: SessionData, fn: any): void {
    const expireTime = this.getExpireTime(sess)
    const query = 'UPDATE session SET expire=TO_TIMESTAMP($1) WHERE sid = $2'
    this.query(query, [expireTime, sid], (err: any) => {
      fn && fn(err)
    })
  }
}
