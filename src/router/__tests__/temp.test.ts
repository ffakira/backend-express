import { describe, expect, it } from '@jest/globals'
import app from '../../index'
import request from 'supertest'
import { StatusCodes } from 'http-status-codes'

enum Routes {
  INDEX = '/'
}

describe(`GET ${Routes.INDEX}`, () => {
  it('should respona a 200 OK status', async () => {
    const response = await request(app).get(Routes.INDEX)
    expect(response.statusCode).toBe(StatusCodes.OK)
  })
})
