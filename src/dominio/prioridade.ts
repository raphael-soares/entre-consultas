export interface ItemPrioridade {
  pensamentosNaUltima: boolean
  pontuacao: number | null
  encaminhadoEm: string
}

// Ordem de atendimento do psiquiatra: pensamentos de se ferir na última resposta,
// depois a pontuação mais alta e, no empate, quem espera há mais tempo.
export function ordenarPorPrioridade<T extends ItemPrioridade>(itens: T[]): T[] {
  return [...itens].sort(
    (a, b) =>
      Number(b.pensamentosNaUltima) - Number(a.pensamentosNaUltima) ||
      (b.pontuacao ?? -1) - (a.pontuacao ?? -1) ||
      a.encaminhadoEm.localeCompare(b.encaminhadoEm),
  )
}
