import { User } from './custom'
type NodeEnv = 'development' | 'test' | 'production'

declare global {
  namespace NodeJS {
    export interface ProcessEnv {
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

  namespace Express {
    export interface Request {
      user?: User
    }
  }
}

export {}
