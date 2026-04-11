import { useState, useCallback, useEffect } from 'react'

export function useFetch(fetchFn, { immediate = true, initialData = [] } = {}) {
  const [data, setData] = useState(initialData)
  const [loading, setLoading] = useState(immediate)
  const [error, setError] = useState(null)

  const execute = useCallback(async (...args) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetchFn(...args)
      setData(response)
      return response
    } catch (err) {
      setError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [fetchFn])

  useEffect(() => {
    if (immediate) {
      execute().catch(() => {})
    }
  }, [execute, immediate])

  return { data, loading, error, setError, execute, setData }
}
