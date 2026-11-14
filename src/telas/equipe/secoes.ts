import { nomeDoUsuario } from '@/dados/fixtures'
import type { DestaqueId } from '@/dominio/destaques'
import { situacaoEncaminhamento } from '@/dominio/encaminhamento'
import { HOJE, diasEntre } from '@/dominio/hoje'
import type { Ficha } from '@/estado/consultas'

export type SecaoId = 'atencao' | 'sem-resposta' | 'sugere' | 'encaminhados' | 'em-dia'

export const SECOES: { id: SecaoId; titulo: string }[] = [
  { id: 'atencao', titulo: 'Precisa de atenção' },
  { id: 'sem-resposta', titulo: 'Sem resposta' },
  { id: 'sugere', titulo: 'Sugere encaminhamento' },
  { id: 'encaminhados', titulo: 'Encaminhados' },
  { id: 'em-dia', titulo: 'Em dia' },
]

export function secaoDe(ficha: Ficha): SecaoId {
  if (ficha.encaminhamento) return 'encaminhados'
  switch (ficha.destaques[0]) {
    case 'risco':
    case 'piorou':
      return 'atencao'
    case 'sem-resposta':
      return 'sem-resposta'
    case 'sugere-encaminhamento':
      return 'sugere'
    default:
      return 'em-dia'
  }
}

export function precisaDeAtencao(ficha: Ficha): boolean {
  return secaoDe(ficha) === 'atencao'
}

export function agrupar(fichas: Ficha[]): { id: SecaoId; titulo: string; fichas: Ficha[] }[] {
  return SECOES.map((s) => ({ ...s, fichas: fichas.filter((f) => secaoDe(f) === s.id) })).filter(
    (s) => s.fichas.length > 0,
  )
}

function dias(n: number): string {
  return n === 1 ? '1 dia' : `${n} dias`
}

export function haDias(iso: string): string {
  const n = diasEntre(iso, HOJE)
  if (n === 0) return 'hoje'
  if (n === 1) return 'ontem'
  return `há ${dias(n)}`
}

export function emDias(iso: string): string {
  const n = diasEntre(HOJE, iso)
  if (n === 0) return 'hoje'
  if (n === 1) return 'amanhã'
  return `em ${dias(n)}`
}

const MOTIVO: Record<DestaqueId, string> = {
  risco: 'pensou em se ferir',
  piorou: 'piorou',
  'sem-resposta': 'sem resposta',
  'sugere-encaminhamento': 'sugere encaminhamento',
}

function nomeCurto(usuarioId: string): string {
  const [titulo, nome] = nomeDoUsuario(usuarioId).split(' ')
  return `${titulo} ${nome}`
}

function situacao(ficha: Ficha): string | null {
  const e = ficha.encaminhamento
  if (!e) return null
  switch (situacaoEncaminhamento(e)) {
    case 'novo':
      return `Enviado ao ${nomeCurto(e.psiquiatraId)}`
    case 'visto':
      return `Visto pelo ${nomeCurto(e.psiquiatraId)}`
    case 'respondido':
      return `Orientação do ${nomeCurto(e.psiquiatraId)}`
  }
}

function atrasoOuProxima(ficha: Ficha): string {
  return diasEntre(ficha.prevista, HOJE) > 0 ? `atrasada ${haDias(ficha.prevista)}` : `próxima ${emDias(ficha.prevista)}`
}

export interface Fragmento {
  texto: string
  risco: boolean
}

function maiuscula(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

// R.N. 008: o destaque principal e os demais aparecem como texto, na linha dos motivos.
export function motivosDaLinha(ficha: Ficha): Fragmento[] {
  const motivos = ficha.destaques.map((d) => ({ texto: MOTIVO[d], risco: d === 'risco' }))
  const encaminhamento = situacao(ficha)
  if (encaminhamento) return [{ texto: encaminhamento, risco: false }, ...motivos]
  return motivos.map((m, i) => ({ ...m, texto: i === 0 ? maiuscula(m.texto) : `também ${m.texto}` }))
}

export function tempoDaLinha(ficha: Ficha): string {
  const respondeu = ficha.ultimaResposta ? `Respondeu ${haDias(ficha.ultimaResposta)}` : 'Sem respostas ainda'
  return `${respondeu} · ${atrasoOuProxima(ficha)}`
}
