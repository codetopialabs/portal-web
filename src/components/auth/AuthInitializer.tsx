'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/store/auth.store'

export function AuthInitializer() {
  const initializeFromCookies = useAuthStore((s) => s.initializeFromCookies)

  useEffect(() => {
    initializeFromCookies()
  }, [initializeFromCookies])

  return null
}
