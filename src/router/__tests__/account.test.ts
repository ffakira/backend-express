import { describe, expect, it } from '@jest/globals'
import app from '../../index'
import request from 'supertest'
import { StatusCodes } from 'http-status-codes'

enum Routes {
  REGISTER = '/account/register',
  LOGIN = '/account/login'
}

describe(`POST ${Routes.REGISTER}`, () => {
  it('should respond with a josn containing the username', async () => {
    const response = await request(app).post(Routes.REGISTER).send({
      username: 'Test',
      password: 'Password'
    })
    expect(response.statusCode).toBe(StatusCodes.CREATED)
    expect(JSON.parse(response.text)).toStrictEqual({
      status: StatusCodes.CREATED,
      data: { username: 'Test' }
    })
  })
})
