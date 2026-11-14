import { describe, expect, it } from 'vitest'
import { estressoresMaisMarcados } from './resumo'
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
