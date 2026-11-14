import { describe, expect, it } from 'vitest'
import { ACOMPANHAMENTOS, ENCAMINHAMENTOS, RESPOSTAS, itensPara } from '@/dados/fixtures'
import { destaques, ordenarLista, type DestaqueId } from './destaques'
import { respostaTratamento, respostasDoAcompanhamento } from './evolucao'
import { HOJE } from './hoje'
import { pontuacao } from './phq9'
import type { Resposta } from './tipos'

function lista(respostas: Resposta[]) {
  return ordenarLista(
    ACOMPANHAMENTOS.filter((a) => a.responsavelId === 'juliana').map((acompanhamento) => {
      const doPaciente = respostasDoAcompanhamento(acompanhamento, respostas)
      const encaminhado = ENCAMINHAMENTOS.some((e) => e.pacienteId === acompanhamento.pacienteId)
      return {
        id: acompanhamento.pacienteId,
        destaques: destaques({ acompanhamento, respostas: doPaciente, encaminhado }, HOJE),
        ultimaResposta: doPaciente.at(-1)?.data,
        tratamento: respostaTratamento(doPaciente, HOJE).tipo,
        encaminhado,
      }
    }),
  )
}

describe('dados da demonstração', () => {
  it('cada resposta tem 9 itens de 0 a 3', () => {
    for (const r of RESPOSTAS) {
      expect(r.itens).toHaveLength(9)
      expect(r.itens.every((i) => i >= 0 && i <= 3)).toBe(true)
    }
  })

  it('itensPara chega exatamente na pontuação pedida', () => {
    expect(pontuacao(itensPara(19, 1))).toBe(19)
    expect(itensPara(19, 1)[8]).toBe(1)
  })

  it('cada paciente mostra o estado que a spec pede', () => {
    const porId = Object.fromEntries(lista(RESPOSTAS).map((p) => [p.id, p]))
    const destaque = (id: string): DestaqueId | 'em-dia' => porId[id].destaques[0] ?? 'em-dia'

    expect(destaque('maria')).toBe('risco')
    expect(destaque('joao')).toBe('piorou')
    expect(destaque('ana')).toBe('sem-resposta')
    expect(destaque('carlos')).toBe('sugere-encaminhamento')
    expect([destaque('fernanda'), porId.fernanda.tratamento]).toEqual(['em-dia', 'adequada'])
    expect([destaque('paulo'), porId.paulo.tratamento]).toEqual(['em-dia', 'cedo'])
    expect(destaque('luciana')).toBe('em-dia')
    expect([destaque('roberto'), porId.roberto.encaminhado]).toEqual(['em-dia', true])
  })

  it('a lista segue a ordem da tabela da spec', () => {
    expect(lista(RESPOSTAS).map((p) => p.id)).toEqual([
      'maria',
      'joao',
      'ana',
      'carlos',
      'fernanda',
      'paulo',
      'luciana',
      'roberto',
    ])
  })

  it('Ana respondendo hoje com pergunta 9 positiva passa para o topo como Risco', () => {
    const novaDaAna: Resposta = {
      id: 'nova',
      pacienteId: 'ana',
      data: HOJE,
      canal: 'whatsapp',
      itens: itensPara(14, 1),
      estressores: ['luto'],
    }

    const [primeiro] = lista([...RESPOSTAS, novaDaAna])

    expect([primeiro.id, primeiro.destaques[0]]).toEqual(['ana', 'risco'])
  })
})
