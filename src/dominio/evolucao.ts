import { dataPrevista } from './agenda'
import { diasEntre, somarDias } from './hoje'
import { pontuacao } from './phq9'
import type { Acompanhamento, Resposta } from './tipos'

export type TipoRespostaTratamento =
  | 'sem-respostas'
  | 'cedo'
  | 'adequada'
  | 'possivelmente-inadequada'
  | 'inadequada'

export const TEXTO_RESPOSTA_TRATAMENTO: Record<TipoRespostaTratamento, string> = {
  'sem-respostas': 'Ainda sem respostas',
  cedo: 'Cedo para avaliar',
  adequada: 'Resposta adequada',
  'possivelmente-inadequada': 'Resposta possivelmente inadequada',
  inadequada: 'Resposta inadequada',
}

export interface RespostaTratamento {
  tipo: TipoRespostaTratamento
  inicial: number | null
  atual: number | null
  queda: number
}

export function respostasDoAcompanhamento(
  acompanhamento: Acompanhamento,
  respostas: Resposta[],
): Resposta[] {
  return respostas
    .filter((r) => r.pacienteId === acompanhamento.pacienteId && r.data >= acompanhamento.inicio)
    .sort((a, b) => a.data.localeCompare(b.data))
}

// R.N. 007: compara com a primeira resposta, só a partir de 4 semanas dela.
export function respostaTratamento(respostas: Resposta[], hoje: string): RespostaTratamento {
  const primeira = respostas.at(0)
  const ultima = respostas.at(-1)
  if (!primeira || !ultima) return { tipo: 'sem-respostas', inicial: null, atual: null, queda: 0 }

  const inicial = pontuacao(primeira.itens)
  const atual = pontuacao(ultima.itens)
  const queda = inicial - atual
  const tipo: TipoRespostaTratamento =
    diasEntre(primeira.data, hoje) < 28
      ? 'cedo'
      : queda >= 5
        ? 'adequada'
        : queda >= 2
          ? 'possivelmente-inadequada'
          : 'inadequada'
  return { tipo, inicial, atual, queda }
}

export function textoVariacao(inicial: number, atual: number): string {
  const diferenca = atual - inicial
  if (diferenca === 0) return `${inicial} → ${atual}, não mudou`
  return `${inicial} → ${atual}, ${diferenca < 0 ? 'caiu' : 'subiu'} ${Math.abs(diferenca)}`
}

export interface Lacuna {
  de: string
  ate: string
}

// Período sem resposta: passou da data prevista em mais de 7 dias (R.N. 008).
export function lacunas(acompanhamento: Acompanhamento, respostas: Resposta[], hoje: string): Lacuna[] {
  const resultado: Lacuna[] = []
  let anterior = acompanhamento.inicio
  for (const resposta of respostas) {
    const prevista = somarDias(anterior, acompanhamento.periodicidade)
    if (diasEntre(prevista, resposta.data) > 7) resultado.push({ de: prevista, ate: resposta.data })
    anterior = resposta.data
  }
  const prevista = dataPrevista(acompanhamento, respostas)
  if (diasEntre(prevista, hoje) > 7) resultado.push({ de: prevista, ate: hoje })
  return resultado
}
