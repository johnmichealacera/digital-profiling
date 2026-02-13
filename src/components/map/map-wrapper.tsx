"use client"

import { useSyncExternalStore } from "react"

const subscribe = () => () => {}
const getSnapshot = () => true
const getServerSnapshot = () => false

export function useIsClient() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

export function ClientOnly({ children }: { children: React.ReactNode }) {
  const isClient = useIsClient()
  if (!isClient) return null
  return <>{children}</>
}
