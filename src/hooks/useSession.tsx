import { useEffect, useState } from 'react'
import { verifyToken } from "@/lib/api"

const SESSION_CHECK_INTERVAL = 60 * 60 * 1000
export const useSession = () => {
  const [isSession, setIsSession] = useState<boolean | undefined>()

  useEffect(() => {
    const checkSession = async () => {
      try {
        await verifyToken()
        setIsSession(true)
      } catch {
        setIsSession(false)
      }
    }

    checkSession()

    const interval = setInterval(checkSession, SESSION_CHECK_INTERVAL)

    return () => clearInterval(interval)
  }, [])

  return isSession
}