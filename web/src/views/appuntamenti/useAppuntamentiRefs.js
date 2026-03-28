import { useState, useCallback, useEffect } from 'react'
import * as clientiApi from '../../api/clientiApi'
import * as operatoriApi from '../../api/operatoriApi'
import * as trattamentiApi from '../../api/trattamentiApi'

export function useAppuntamentiRefs(includeClienti = true) {
  const [clienti, setClienti] = useState([])
  const [operatori, setOperatori] = useState([])
  const [trattamenti, setTrattamenti] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const promises = [
        operatoriApi.listOperatori({ soloAttivi: true }),
        trattamentiApi.listTrattamenti({ soloAttivi: true }),
      ]
      if (includeClienti) {
        promises.push(clientiApi.listClienti())
      }

      const results = await Promise.all(promises)
      setOperatori(results[0])
      setTrattamenti(results[1])
      if (includeClienti) {
        setClienti(results[2])
      }
    } catch (e) {
      setError(e)
    } finally {
      setLoading(false)
    }
  }, [includeClienti])

  useEffect(() => {
    load()
  }, [load])

  return { clienti, operatori, trattamenti, loading, error, reload: load }
}
