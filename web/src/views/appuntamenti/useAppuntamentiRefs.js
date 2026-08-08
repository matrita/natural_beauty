import { useState, useCallback, useEffect } from 'react'
import * as clientiApi from '../../api/clientiApi'
import * as operatoriApi from '../../api/operatoriApi'
import * as trattamentiApi from '../../api/trattamentiApi'
import * as configApi from '../../api/configApi'

export function useAppuntamentiRefs(includeClienti = true) {
  const [clienti, setClienti] = useState([])
  const [operatori, setOperatori] = useState([])
  const [trattamenti, setTrattamenti] = useState([])
  const [orari, setOrari] = useState({ apertura: '09:00', chiusura: '18:00' })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const promises = [
        operatoriApi.listOperatori({ soloAttivi: true }),
        trattamentiApi.listTrattamenti({ soloAttivi: true }),
        configApi.getOrari()
      ]
      if (includeClienti) {
        promises.push(clientiApi.listClienti())
      }

      const results = await Promise.all(promises)
      setOperatori(results[0])
      setTrattamenti(results[1])
      setOrari(results[2])
      
      if (includeClienti) {
        setClienti(results[3])
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

  return { clienti, operatori, trattamenti, orari, loading, error, reload: load }
}
