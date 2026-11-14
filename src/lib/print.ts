import { useSearchParams } from 'react-router'

// `?print=1` esconde os controles da demonstração nos prints.
export function useModoPrint(): boolean {
  const [params] = useSearchParams()
  return params.get('print') === '1'
}
