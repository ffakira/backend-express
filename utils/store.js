/** @dev Non-customised configuration Postgres store
 * inspired from node-connect-pg-simple package
 */
// eslint-disable-next-line no-unused-vars
const { Session, Store } = require('express-session')
// eslint-disable-next-line no-unused-vars
const { Pool } = require('pg')
const pool = require('../db')
const ONE_DAY = 86_400

/**
 * @typedef PgStoreOptions
 * @property {number} [ttl] seconds
 * @property {Pool} [pool] pg.Pool
 */

/**
 * @param {Session} session
 * @returns {Store}
 */
module.exports = (session) => {
  /** @type {Store} */
  const Store = session.Store

  class PgStore extends Store {
    /**
     * @param {PgStoreOptions} options
     */
    constructor (options = {}) {
      super(options)

      this.pool = pool || options.pool
      this.ttl = ONE_DAY || options.ttl
    }

    /**
     * @dev Initialize session table if doesn't exist
     * @returns {Promise.<void>}
     * @access private
     */
    async #initializeTable () {
      const query = `CREATE TABLE IF NOT EXISTS session (
        sid VARCHAR,
        sess JSON NOT NULL,
        expire TIMESTAMP NOT NULL
      );

      CREATE INDEX "idx_session_expire" ON session("expire");
      `

      try {
        await pool.query(query)
        console.log('[PgStore]: session table created successfully')
      } catch (err) {
        console.error('[error]: PgStore error:', err.message)
      }
    }

    /**
     * @returns {Promise.<boolean>}
     * @access private
     */
    async #checkTableExists () {
      const query = 'SELECT \'session\'::regclass'

      try {
        await pool.query(query)
        return true
      } catch (err) {
        console.error('[PgStore]: PgStore error:', err.message)
        return false
      }
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
        const ttl = this.ttl || ONE_DAY
        expire = Math.ceil(Date.now() / 1000 + ttl)
      }
      return expire
    }
  }

  return PgStore
}
