import { describe, expect, it } from 'vitest'
import { destaques, ordenarLista, piorou, risco, semResposta, sugereEncaminhamento } from './destaques'
import { HOJE } from './hoje'
import { acomp, resp } from './teste-apoio'
import type { Resposta } from './tipos'

describe('risco', () => {
  it('vem da pergunta 9 da última resposta e some com uma resposta nova negativa', () => {
    expect(risco([resp(16, 10), resp(2, 12, 1)])).toBe(true)
    expect(risco([resp(16, 10, 2), resp(2, 12)])).toBe(false)
  })
})

describe('piorou', () => {
  it('só quando a última pontuação sobe de faixa', () => {
    expect(piorou([resp(16, 9), resp(2, 10)])).toBe(true)
    expect(piorou([resp(16, 10), resp(2, 14)])).toBe(false)
  })

  it('com uma resposta só não há comparação', () => {
    expect(piorou([resp(2, 20)])).toBe(false)
  })
})

describe('semResposta', () => {
  it('7 dias depois da data prevista ainda não é sem resposta; 8 dias é', () => {
    expect(semResposta(acomp(30), [resp(21, 10)], HOJE)).toBe(false)
    expect(semResposta(acomp(30), [resp(22, 10)], HOJE)).toBe(true)
  })

  it('sem nenhuma resposta conta a partir do início', () => {
    expect(semResposta(acomp(22), [], HOJE)).toBe(true)
  })
})

describe('sugereEncaminhamento', () => {
  const situacao = (inicio: number, respostas: Resposta[], encaminhado = false) => ({
    acompanhamento: acomp(inicio),
    respostas,
    encaminhado,
  })

  it('com 16 semanas e queda de 4 pontos sugere', () => {
    expect(sugereEncaminhamento(situacao(112, [resp(110, 18), resp(2, 14)]), HOJE)).toBe(true)
  })

  it('com 16 semanas e queda de 5 pontos não sugere', () => {
    expect(sugereEncaminhamento(situacao(112, [resp(110, 18), resp(2, 13)]), HOJE)).toBe(false)
  })

  it('com 15 semanas ainda não sugere pela pontuação', () => {
    expect(sugereEncaminhamento(situacao(111, [resp(110, 18), resp(2, 18)]), HOJE)).toBe(false)
  })

  it('pergunta 9 positiva em respostas que cobrem 12 semanas sugere', () => {
    const respostas = [resp(72, 10, 1), resp(58, 10, 1), resp(44, 10, 1), resp(30, 10, 1), resp(16, 10, 1), resp(2, 10, 1)]

    expect(sugereEncaminhamento(situacao(74, respostas), HOJE)).toBe(true)
  })

  it('pergunta 9 positiva cobrindo 10 semanas ainda não sugere', () => {
    const respostas = [resp(72, 10), resp(58, 10, 1), resp(44, 10, 1), resp(30, 10, 1), resp(16, 10, 1), resp(2, 10, 1)]

    expect(sugereEncaminhamento(situacao(74, respostas), HOJE)).toBe(false)
  })

  it('quem já foi encaminhado não recebe sugestão', () => {
    expect(sugereEncaminhamento(situacao(112, [resp(110, 18), resp(2, 18)], true), HOJE)).toBe(false)
  })
})

describe('destaques', () => {
  it('lista todos os destaques ativos na ordem de prioridade', () => {
    const respostas = [resp(130, 14), resp(20, 13), resp(15, 16, 1)]

    expect(destaques({ acompanhamento: acomp(132), respostas, encaminhado: false }, HOJE)).toEqual([
      'risco',
      'piorou',
      'sugere-encaminhamento',
    ])
  })

  it('sem destaque nenhum a lista fica vazia (Em dia)', () => {
    expect(destaques({ acompanhamento: acomp(30), respostas: [resp(28, 15), resp(2, 9)], encaminhado: false }, HOJE)).toEqual([])
  })
})

describe('ordenarLista', () => {
  it('ordena pelo destaque mais alto e, no empate, por quem respondeu por último', () => {
    const itens = [
      { nome: 'em dia', destaques: [], ultimaResposta: '2026-11-26' },
      { nome: 'sem resposta', destaques: ['sem-resposta' as const], ultimaResposta: '2026-10-01' },
      { nome: 'risco antigo', destaques: ['risco' as const], ultimaResposta: '2026-11-20' },
      { nome: 'piorou', destaques: ['piorou' as const, 'sem-resposta' as const], ultimaResposta: '2026-11-25' },
      { nome: 'risco novo', destaques: ['risco' as const], ultimaResposta: '2026-11-27' },
    ]

    expect(ordenarLista(itens).map((i) => i.nome)).toEqual([
      'risco novo',
      'risco antigo',
      'piorou',
      'sem resposta',
      'em dia',
    ])
  })
})
