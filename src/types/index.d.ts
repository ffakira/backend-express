import { User } from './custom'
type NodeEnv = 'development' | 'test' | 'production'

export declare namespace Express {
  export interface Request {
    user?: User
  }
}

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: NodeEnv
      PORT?: string | number
      COOKIE_NAME: string
      COOKIE_SECRET: string
      DB_NAME: string
      DB_USERNAME: string
      DB_PASSWORD: string
      DB_PORT: number | undefined
      DB_HOST: string
      SALT_ROUNDS: number
    }
  }
}

declare module 'express-session' {
  export interface SessionData {
    isAuth?: boolean
    username?: string
    attemptAccessTime?: null | number
    passwordAttempts?: null | number
  }
}

export {}
