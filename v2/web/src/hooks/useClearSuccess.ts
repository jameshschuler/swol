import { useEffect } from 'react'

export function useClearSuccess(
  mutation: { isSuccess: boolean; reset: () => void },
  delayMs: number,
) {
  const { isSuccess, reset } = mutation
  useEffect(() => {
    if (!isSuccess) {
      return
    }
    const timeout = setTimeout(reset, delayMs)
    return () => clearTimeout(timeout)
  }, [isSuccess, reset, delayMs])
}
