import { useEffect, useRef, useState } from 'react'

const genericError = 'Something went wrong. Please try again.'

export function useAuthAction(initialError: string | null = null) {
  const [error, setError] = useState(initialError)
  const [pending, setPending] = useState(false)
  const inFlight = useRef(false)

  useEffect(() => {
    const restoreFromBackForwardCache = (event: PageTransitionEvent) => {
      if (event.persisted) {
        inFlight.current = false
        setPending(false)
      }
    }
    window.addEventListener('pageshow', restoreFromBackForwardCache)
    return () =>
      window.removeEventListener('pageshow', restoreFromBackForwardCache)
  }, [])

  async function run(
    action: () => Promise<string | null>,
    { keepPendingOnSuccess = false } = {},
  ): Promise<boolean> {
    if (inFlight.current) {
      return false
    }
    inFlight.current = true
    setPending(true)
    setError(null)
    try {
      const failure = await action()
      const succeeded = !failure
      setError(succeeded ? null : failure)
      if (!succeeded || !keepPendingOnSuccess) {
        inFlight.current = false
        setPending(false)
      }
      return succeeded
    } catch {
      setError(genericError)
      inFlight.current = false
      setPending(false)
      return false
    }
  }

  return { error, setError, pending, run }
}
