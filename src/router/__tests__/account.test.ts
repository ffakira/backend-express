import { describe, expect, it } from '@jest/globals'
import app from '../../index'
import request from 'supertest'
import { StatusCodes } from 'http-status-codes'

process.env.NODE_ENV = 'test'

enum Routes {
  REGISTER = '/account/register',
  LOGIN = '/account/login'
}

describe(`POST ${Routes.REGISTER}`, () => {
  it('should respond a Bad Request status, if one of req.body is missing', async () => {
    const resBody = [
      {},
      { username: 'test' },
      { password: 'password' },
      { username: null, password: null },
      { username: undefined, password: undefined },
      { invalidParam: 'test', invalidParam2: 'test2' }
    ]
    for (const body of resBody) {
      const response = await request(app).post(Routes.REGISTER).send(body)
      expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST)
    }
  })
})
