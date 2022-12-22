import { StatusCodes } from 'http-status-codes'

export type CustomResponse = {
  status: StatusCodes
  msg?: string
  data?: any
}

export interface User extends CustomResponse {
  data?: {
    username: string
  }
}

export {}
