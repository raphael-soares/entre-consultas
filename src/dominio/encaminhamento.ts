import type { Encaminhamento } from './tipos'

export type SituacaoEncaminhamento = 'novo' | 'visto' | 'respondido'

export function situacaoEncaminhamento(e: Pick<Encaminhamento, 'vistoEm' | 'contrarreferencia'>): SituacaoEncaminhamento {
  if (e.contrarreferencia) return 'respondido'
  if (e.vistoEm) return 'visto'
  return 'novo'
}

export const NOMES_SITUACAO: Record<SituacaoEncaminhamento, string> = {
  novo: 'Novo',
  visto: 'Visto',
  respondido: 'Respondido',
}
