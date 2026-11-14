import { describe, expect, it } from 'vitest'
import { faixa, pontuacao, rastreioPositivo } from './phq9'

describe('pontuacao', () => {
  it('soma as 9 respostas', () => {
    expect(pontuacao([3, 3, 2, 1, 0, 1, 2, 0, 1])).toBe(13)
  })
})

describe('faixa', () => {
  it.each([
    [0, 'minima'],
    [4, 'minima'],
    [5, 'leve'],
    [9, 'leve'],
    [10, 'moderada'],
    [14, 'moderada'],
    [15, 'moderadamente-grave'],
    [19, 'moderadamente-grave'],
    [20, 'grave'],
    [27, 'grave'],
  ])('pontuação %i fica na faixa %s', (p, esperada) => {
    expect(faixa(p).id).toBe(esperada)
  })
})

describe('rastreioPositivo', () => {
  it('é positivo a partir de 9 pontos', () => {
    expect(rastreioPositivo(8)).toBe(false)
    expect(rastreioPositivo(9)).toBe(true)
  })
})
