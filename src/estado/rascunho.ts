import type { Estressor } from '@/dominio/tipos'
import type { Rascunho } from './store'

const ITENS_DE_EXEMPLO = [1, 2, 1, 2, 1, 1, 1, 0]

export function rascunhoVazio(): Rascunho {
  return { itens: Array(9).fill(null), estressores: [] }
}

// Abrir um passo do meio pelo link (prints, demonstração) precisa das respostas anteriores.
export function rascunhoDeExemplo(respondidas: number, pergunta9 = 0, estressores: Estressor[] = []): Rascunho {
  const itens = [...ITENS_DE_EXEMPLO, pergunta9].map((valor, i) => (i < respondidas ? valor : null))
  return { itens, estressores }
}

export function primeiraEmBranco(rascunho: Rascunho): number {
  return rascunho.itens.findIndex((i) => i === null)
}
