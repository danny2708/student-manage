// hooks/useEvaluations.ts
import { useEffect, useState } from "react"
import { getEvaluations, Evaluation } from "../services/api/evaluation"

export function useEvaluations() {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getEvaluations()
        setEvaluations(data)
      } catch (err) {
        setError("Failed to fetch evaluations")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return { evaluations, loading, error }
}
