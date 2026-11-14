import { describe, expect, it } from 'vitest'
import { estressoresMaisMarcados, lerPergunta9 } from './resumo'
import { resp } from './teste-apoio'
import type { Estressor } from './tipos'

const com = (diasAtras: number, estressores: Estressor[]) => ({ ...resp(diasAtras, 10), estressores })

describe('estressoresMaisMarcados', () => {
  it('conta só as últimas 4 respostas, do mais marcado para o menos', () => {
    const respostas = [
      com(70, ['luto', 'luto']),
      com(56, ['dinheiro']),
      com(42, ['dinheiro', 'familia']),
      com(28, ['familia']),
      com(14, ['dinheiro']),
    ]

    expect(estressoresMaisMarcados(respostas)).toEqual([
      { estressor: 'dinheiro', vezes: 3 },
      { estressor: 'familia', vezes: 2 },
    ])
  })
})

describe('lerPergunta9', () => {
  const h = (...pares: [string, number][]) => pares.map(([data, valor]) => ({ data: `2026-${data}`, valor }))

  it('conta as semanas da sequência positiva mais recente', () => {
    expect(lerPergunta9(h(['07-26', 0], ['08-09', 1], ['08-23', 2], ['11-01', 1]))).toEqual({
      positiva: true,
      titulo: 'Positiva há 12 semanas',
      detalhe: 'Nas últimas 3 respostas, desde 09/08',
    })
  })

  it('separa a primeira positiva de uma que volta', () => {
    expect(lerPergunta9(h(['10-01', 0], ['10-15', 1])).detalhe).toBe('Primeira vez neste acompanhamento')
    expect(lerPergunta9(h(['10-01', 2], ['10-15', 0], ['10-29', 1])).detalhe).toBe('Positiva em 2 de 3 respostas')
  })

  it('última negativa ainda mostra quando foi a última positiva', () => {
    expect(lerPergunta9(h(['10-01', 1], ['10-15', 1], ['10-29', 0]))).toEqual({
      positiva: false,
      titulo: 'Negativa na última resposta',
      detalhe: 'Positiva em 2 de 3, a última em 15/10',
    })
  })

  it('sem nenhuma positiva', () => {
    expect(lerPergunta9(h(['10-01', 0], ['10-15', 0])).titulo).toBe('Sempre negativa')
  })
})
