import { useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { CADASTROS } from '@/dados/fixtures'
import { dataPrevista, lembretes } from '@/dominio/agenda'
import { destaques, ordenarLista, type DestaqueId } from '@/dominio/destaques'
import {
  lacunas,
  respostaTratamento,
  respostasDoAcompanhamento,
  type Lacuna,
  type RespostaTratamento,
} from '@/dominio/evolucao'
import { HOJE } from '@/dominio/hoje'
import { pontuacao } from '@/dominio/phq9'
import { ordenarPorPrioridade } from '@/dominio/prioridade'
import type {
  Acompanhamento,
  CadastroEsus,
  Encaminhamento,
  Resposta,
  Transferencia,
} from '@/dominio/tipos'
import { acompanhamentoAtivo, useStore } from './store'

interface Dados {
  respostas: Resposta[]
  acompanhamentos: Acompanhamento[]
  encaminhamentos: Encaminhamento[]
  transferencias: Transferencia[]
}

export interface Ficha {
  cadastro: CadastroEsus
  acompanhamento: Acompanhamento
  respostas: Resposta[]
  ultima?: Resposta
  ultimaResposta?: string
  encaminhamento?: Encaminhamento
  transferencias: Transferencia[]
  destaques: DestaqueId[]
  prevista: string
  lembretes: string[]
  lacunas: Lacuna[]
  tratamento: RespostaTratamento
}

export function montarFicha(dados: Dados, pacienteId: string, acompanhamento?: Acompanhamento): Ficha | null {
  const cadastro = CADASTROS.find((c) => c.id === pacienteId)
  const acomp = acompanhamento ?? acompanhamentoAtivo(dados.acompanhamentos, pacienteId)
  if (!cadastro || !acomp) return null
  const respostas = respostasDoAcompanhamento(acomp, dados.respostas)
  const encaminhamento = dados.encaminhamentos.find((e) => e.pacienteId === pacienteId)
  const ate = acomp.encerramento?.data ?? HOJE
  return {
    cadastro,
    acompanhamento: acomp,
    respostas,
    ultima: respostas.at(-1),
    ultimaResposta: respostas.at(-1)?.data,
    encaminhamento,
    transferencias: dados.transferencias.filter((t) => t.pacienteId === pacienteId),
    destaques: destaques({ acompanhamento: acomp, respostas, encaminhado: !!encaminhamento }, HOJE),
    prevista: dataPrevista(acomp, respostas),
    lembretes: lembretes(cadastro, acomp, respostas),
    lacunas: lacunas(acomp, respostas, ate),
    tratamento: respostaTratamento(respostas, ate),
  }
}

export function useDados(): Dados {
  return useStore(
    useShallow((s) => ({
      respostas: s.respostas,
      acompanhamentos: s.acompanhamentos,
      encaminhamentos: s.encaminhamentos,
      transferencias: s.transferencias,
    })),
  )
}

export function useFicha(pacienteId: string | undefined): Ficha | null {
  const dados = useDados()
  return useMemo(() => (pacienteId ? montarFicha(dados, pacienteId) : null), [dados, pacienteId])
}

export function useListaDoResponsavel(responsavelId: string | undefined): Ficha[] {
  const dados = useDados()
  return useMemo(() => {
    const fichas = dados.acompanhamentos
      .filter((a) => !a.encerramento && a.responsavelId === responsavelId)
      .map((a) => montarFicha(dados, a.pacienteId, a))
      .filter((f): f is Ficha => f !== null)
    return ordenarLista(fichas)
  }, [dados, responsavelId])
}

// Encerrado o acompanhamento, vale o que estava aberto na data do encaminhamento.
export function fichaDoEncaminhamento(dados: Dados, encaminhamento: Encaminhamento): Ficha | null {
  const { pacienteId, data } = encaminhamento
  const acomp =
    acompanhamentoAtivo(dados.acompanhamentos, pacienteId) ??
    dados.acompanhamentos.filter((a) => a.pacienteId === pacienteId && a.inicio <= data).at(-1)
  return montarFicha(dados, pacienteId, acomp)
}

export interface CasoEncaminhado {
  encaminhamento: Encaminhamento
  ficha: Ficha
}

export function useEncaminhamentosDe(psiquiatraId: string | undefined): CasoEncaminhado[] {
  const dados = useDados()
  return useMemo(() => {
    const casos = dados.encaminhamentos
      .filter((e) => e.psiquiatraId === psiquiatraId)
      .map((encaminhamento) => ({ encaminhamento, ficha: fichaDoEncaminhamento(dados, encaminhamento) }))
      .filter((c): c is CasoEncaminhado => c.ficha !== null)
      .map((caso) => ({
        ...caso,
        pensamentosNaUltima: (caso.ficha.ultima?.itens[8] ?? 0) > 0,
        pontuacao: caso.ficha.ultima ? pontuacao(caso.ficha.ultima.itens) : null,
        encaminhadoEm: caso.encaminhamento.data,
      }))
    return ordenarPorPrioridade(casos)
  }, [dados, psiquiatraId])
}
