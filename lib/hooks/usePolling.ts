"use client"
import { useEffect, useCallback } from "react"

export function usePolling(fn: () => void, intervalMs = 30000, enabled = true) {
  const stableFn = useCallback(fn, [fn])

  useEffect(() => {
    if (!enabled) return
    stableFn()
    const id = setInterval(stableFn, intervalMs)
    return () => clearInterval(id)
  }, [stableFn, intervalMs, enabled])
}
