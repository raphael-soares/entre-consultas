import type { Encaminhamento } from './tipos'

export type SituacaoEncaminhamento = 'novo' | 'visto' | 'consulta-marcada' | 'respondido'

export function situacaoEncaminhamento(e: Pick<Encaminhamento, 'vistoEm' | 'consulta' | 'contrarreferencia'>): SituacaoEncaminhamento {
  if (e.contrarreferencia) return 'respondido'
  if (e.consulta) return 'consulta-marcada'
  if (e.vistoEm) return 'visto'
  return 'novo'
}

export const NOMES_SITUACAO: Record<SituacaoEncaminhamento, string> = {
  novo: 'Novo',
  visto: 'Visto',
  'consulta-marcada': 'Consulta marcada',
  respondido: 'Respondido',
}
