import { describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from './route'

const { authenticateMock, getTokenRemainingTimeMock, signTokenMock, setAuthCookieMock } =
  vi.hoisted(() => ({
    authenticateMock: vi.fn(),
    getTokenRemainingTimeMock: vi.fn(),
    signTokenMock: vi.fn(),
    setAuthCookieMock: vi.fn(),
  }))

vi.mock('@/server/auth', () => ({
  authenticate: authenticateMock,
   setAuthCookie: setAuthCookieMock,
}))

vi.mock('@/server/jwt', () => ({
  getTokenRemainingTime: getTokenRemainingTimeMock,
  signToken: signTokenMock,
}))



const ONE_DAY = 24 * 60 * 60 * 1000

const createRequest = () =>
  new NextRequest('http://localhost/api/atualizatoken', {
    method: 'POST',
  })

describe('POST /api/atualizatoken', () => {
  it('should return the current token when it has more than one day remaining', async () => {
    authenticateMock.mockReturnValue({
      token: 'current-token',
      userId: '123',
    })

    getTokenRemainingTimeMock.mockReturnValue(ONE_DAY + 1000)

    const response = await POST(createRequest())

    expect(response.status).toBe(200)
    expect(signTokenMock).not.toHaveBeenCalled()
    expect(setAuthCookieMock).not.toHaveBeenCalled()
  })

  it('should renew the token when it has one day or less remaining', async () => {
    authenticateMock.mockReturnValue({
      token: 'current-token',
      userId: '123',
    })

    getTokenRemainingTimeMock.mockReturnValue(ONE_DAY)

    signTokenMock.mockReturnValue('new-token')

    const response = await POST(createRequest())

    expect(response.status).toBe(200)
    expect(signTokenMock).toHaveBeenCalledWith('123')
    expect(setAuthCookieMock).toHaveBeenCalled()
  })
})