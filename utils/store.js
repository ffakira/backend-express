/** @dev Non-customised configuration Postgres store
 * inspired from node-connect-pg-simple package
 * original source: https://github.com/voxpelli/node-connect-pg-simple/blob/main/index.js
 */
// eslint-disable-next-line no-unused-vars
const { Session, Store } = require('express-session')
// eslint-disable-next-line no-unused-vars
const { Pool, QueryResult } = require('pg')
const pool = require('../db')
const ONE_DAY = 86_400

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
const callbackifyPromiseResolution = (value, cb) => {
  if (!cb) value.catch(() => {})
  else {
    value.then(
      (ret) => process.nextTick(cb, null, ret),
      (err) => process.nextTick(cb, err || new Error('Promise was rejected with falsy value'))
    )
  }
}

const currentTimestamp = () => Math.ceil(Date.now() / 1000)

/**
 * @typedef PgStoreOptions
 * @property {number} [ttl]
 * @property {Pool} [pool]
 * @property {boolean} [disableTouch]
 */

/**
 * @param {Session} session
 * @returns {Store}
 */
module.exports = (session) => {
  /** @type {Store} */
  const Store = session.Store

  class PgStore extends Store {
    #pool
    #ttl
    #disableTouch
    /**
     * @param {PgStoreOptions} options
     */
    constructor (options = {}) {
      super(options)

      this.#pool = options.pool || pool
      this.#ttl = ONE_DAY || options.ttl
      this.#disableTouch = !!options.disableTouch
    }

    /**
     * @param {string} query
     * @param {any[]} params
     * @returns {Promise.<QueryResult> | undefined}
     */
    async #asyncQuery (query, params) {
      if (!this.#pool) throw new Error('Pool object is missing')

      try {
        const resp = await this.#pool.query(query, params)
        return resp && resp.rows && resp.rows[0] ? resp.rows[0] : undefined
      } catch (err) {
        return undefined
      }
    }

    #query (query, params, fn) {
      let resolveParams

      if (typeof params === 'function') {
        if (fn) throw new Error('Two callback functions set at once')
        fn = params
        resolveParams = []
      } else {
        resolveParams = params || []
      }

      const result = this.#asyncQuery(query, resolveParams)
      callbackifyPromiseResolution(result, fn)
    }

    /**
     * @param {number} sess
     * @access private
     */
    #getExpireTime (sess) {
      let expire
      if (sess && sess.cookie && sess.cookie.expires) {
        const expireDate = new Date(sess.cookie.expires)
        expire = Math.ceil(expireDate.valueOf() / 1000)
      } else {
        const ttl = this.#ttl || ONE_DAY
        expire = Math.ceil(Date.now() / 1000 + ttl)
      }
      return expire
    }

    /**
     * @param {string} sid session id
     * @param {*} fn callback function returns session object
     * @access public
     */
    get (sid, fn) {
      const query = 'SELECT sess FROM session WHERE sid = $1 AND expire >= TO_TIMESTAMP($2)'
      this.#query(query, [sid, currentTimestamp()], (err, data) => {
        if (err) return fn(err)
        if (!data) return fn(null)
        try {
          return fn(null, (typeof data.sess === 'string' ? JSON.parse(data.sess) : data.sess))
        } catch {
          return this.destroy(sid, fn)
        }
      })
    }

    /**
     * @param {string} sid session id
     * @param {Session} sess session object
     * @param {*} fn callback function returns session object
     * @access public
     */
    set (sid, sess, fn) {
      console.log('trigger set')
      const expireTime = this.#getExpireTime(sess)
      const query = `INSERT INTO session (sess, expire, sid) VALUES ($1, TO_TIMESTAMP($2), $3)
        ON CONFLICT (sid) DO UPDATE SET sess=$1
      `
      this.#query(query, [sess, expireTime, sid], err => { fn && fn(err) })
    }

    /**
     * @param {string} sid session id
     * @param {*} fn callback function returns session object
     * @access public
     */
    destroy (sid, fn) {
      const query = 'DELETE FROM session WHERE sid = $1'
      this.#query(query, [sid], err => { fn && fn(err) })
    }

    /**
     * @param {string} sid session id
     * @param {Session} sess session object
     * @param {*} fn callback function returns session object
     * @access public
     */
    touch (sid, sess, fn) {
      if (this.#disableTouch) {
        fn && fn(null)
        return {}
      }

      const expireTime = this.#getExpireTime(sess)
      const query = 'UPDATE session SET expire=TO_TIMESTAMP($1) WHERE sid = $2 RETURNING sid'
      this.#query(query, [expireTime, sid], err => { fn && fn(err) })
    }
  }

  return PgStore
}
