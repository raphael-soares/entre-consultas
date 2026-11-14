import { describe, expect, it } from 'vitest'
import { dataPorExtenso } from './hoje'

describe('dataPorExtenso', () => {
  it('escreve o dia da semana sem deslocar a data pelo fuso', () => {
    expect(dataPorExtenso('2026-11-27')).toBe('Sexta-feira, 27 de novembro')
    expect(dataPorExtenso('2026-12-01')).toBe('Terça-feira, 1 de dezembro')
  })
})
