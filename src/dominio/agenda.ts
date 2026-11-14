import { somarDias } from './hoje'
import type { Acompanhamento, CadastroEsus, Resposta } from './tipos'

// R.N. 004: a próxima data conta da última resposta ou, sem resposta, do início.
export function dataPrevista(acompanhamento: Acompanhamento, respostas: Resposta[]): string {
  const ultima = respostas.at(-1)
  return somarDias(ultima?.data ?? acompanhamento.inicio, acompanhamento.periodicidade)
}

// R.N. 009: na data prevista e 3 dias depois, só para quem tem celular.
export function lembretes(cadastro: CadastroEsus, acompanhamento: Acompanhamento, respostas: Resposta[]): string[] {
  if (!cadastro.celular) return []
  const prevista = dataPrevista(acompanhamento, respostas)
  return [prevista, somarDias(prevista, 3)]
}
