import { useEffect, useRef } from 'react'

export function useDidMount(callback: () => void): void {
  const hasRunOnceRef = useRef(false)

  useEffect(() => {
    if (!hasRunOnceRef.current) {
      hasRunOnceRef.current = true
      callback()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
