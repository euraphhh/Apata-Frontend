import { NextResponse, type NextRequest } from 'next/server'
import { authenticate, setAuthCookie } from '@/server/auth'
import { getTokenRemainingTime, signToken } from '@/server/jwt'

const ONE_DAY = 24 * 60 * 60 * 1000

export async function POST(request: NextRequest) {
  const auth = authenticate(request)
  if ('error' in auth) return auth.error

  try {
    const remainingTime = getTokenRemainingTime(auth.token)
    if (remainingTime !== null && remainingTime > ONE_DAY) {
      return NextResponse.json({
        msg: 'Token ainda é válido',
        token: auth.token
      }, { status: 200 })
    }

    const novoToken = signToken(auth.userId)
    const response = NextResponse.json({ msg: 'Token atualizado com sucesso', token: novoToken }, { status: 200 })
    setAuthCookie(response, novoToken)
    return response
  } catch {
    return NextResponse.json({ error: 'Erro ao renovar token' }, { status: 401 })
  }
}
