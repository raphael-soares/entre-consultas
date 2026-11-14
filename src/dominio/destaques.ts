import { dataPrevista } from './agenda'
import { diasEntre, semanasEntre } from './hoje'
import { faixa, pergunta9Positiva, pontuacao } from './phq9'
import type { Acompanhamento, Resposta } from './tipos'

export type DestaqueId = 'risco' | 'piorou' | 'sem-resposta' | 'sugere-encaminhamento'

export const DESTAQUES: { id: DestaqueId; nome: string }[] = [
  { id: 'risco', nome: 'Risco' },
  { id: 'piorou', nome: 'Piorou' },
  { id: 'sem-resposta', nome: 'Sem resposta' },
  { id: 'sugere-encaminhamento', nome: 'Sugere encaminhamento' },
]

export interface Situacao {
  acompanhamento: Acompanhamento
  respostas: Resposta[]
  encaminhado: boolean
}

// R.N. 001: vale até a próxima resposta.
export function risco(respostas: Resposta[]): boolean {
  const ultima = respostas.at(-1)
  return ultima !== undefined && pergunta9Positiva(ultima.itens)
}

export function piorou(respostas: Resposta[]): boolean {
  if (respostas.length < 2) return false
  const [anterior, ultima] = respostas.slice(-2)
  return faixa(pontuacao(ultima.itens)).ordem > faixa(pontuacao(anterior.itens)).ordem
}

export function semResposta(acompanhamento: Acompanhamento, respostas: Resposta[], hoje: string): boolean {
  return diasEntre(dataPrevista(acompanhamento, respostas), hoje) > 7
}

// R.N. 003. Cada PHQ-9 cobre as 2 semanas anteriores à resposta.
export function sugereEncaminhamento({ acompanhamento, respostas, encaminhado }: Situacao, hoje: string): boolean {
  const primeira = respostas.at(0)
  const ultima = respostas.at(-1)
  if (encaminhado || !primeira || !ultima) return false

  const semMelhora =
    semanasEntre(acompanhamento.inicio, hoje) >= 16 &&
    pontuacao(primeira.itens) - pontuacao(ultima.itens) < 5
  if (semMelhora) return true

  let inicioPositivas: Resposta | undefined
  for (let i = respostas.length - 1; i >= 0 && pergunta9Positiva(respostas[i].itens); i--) {
    inicioPositivas = respostas[i]
  }
  return inicioPositivas !== undefined && diasEntre(inicioPositivas.data, ultima.data) + 14 >= 84
}

// R.N. 008: em ordem de prioridade; lista vazia é "Em dia".
export function destaques(situacao: Situacao, hoje: string): DestaqueId[] {
  const { acompanhamento, respostas } = situacao
  const ativos: Record<DestaqueId, boolean> = {
    risco: risco(respostas),
    piorou: piorou(respostas),
    'sem-resposta': semResposta(acompanhamento, respostas, hoje),
    'sugere-encaminhamento': sugereEncaminhamento(situacao, hoje),
  }
  return DESTAQUES.map((d) => d.id).filter((id) => ativos[id])
}

export function nomeDestaque(id: DestaqueId): string {
  return DESTAQUES.find((d) => d.id === id)!.nome
}

interface ItemLista {
  destaques: DestaqueId[]
  ultimaResposta?: string
}

// Dentro do mesmo destaque, quem respondeu mais recentemente vem primeiro.
export function ordenarLista<T extends ItemLista>(itens: T[]): T[] {
  const peso = (item: T) =>
    item.destaques.length ? DESTAQUES.findIndex((d) => d.id === item.destaques[0]) : DESTAQUES.length
  return [...itens].sort(
    (a, b) => peso(a) - peso(b) || (b.ultimaResposta ?? '').localeCompare(a.ultimaResposta ?? ''),
  )
}
