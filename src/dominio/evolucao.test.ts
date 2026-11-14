import { describe, expect, it } from 'vitest'
import { lacunas, respostaTratamento, textoVariacao } from './evolucao'
import { HOJE, somarDias } from './hoje'
import { acomp, resp } from './teste-apoio'

describe('respostaTratamento', () => {
  it('sem respostas não avalia', () => {
    expect(respostaTratamento([], HOJE).tipo).toBe('sem-respostas')
  })

  it('antes de 4 semanas da primeira resposta é cedo para avaliar, mesmo com queda grande', () => {
    expect(respostaTratamento([resp(27, 20), resp(1, 5)], HOJE).tipo).toBe('cedo')
  })

  it('com 4 semanas já avalia', () => {
    expect(respostaTratamento([resp(28, 20), resp(1, 15)], HOJE).tipo).toBe('adequada')
  })

  it.each([
    [20, 15, 'adequada'],
    [20, 16, 'possivelmente-inadequada'],
    [20, 18, 'possivelmente-inadequada'],
    [20, 19, 'inadequada'],
    [15, 18, 'inadequada'],
  ])('de %i para %i é %s', (inicial, atual, esperado) => {
    const resultado = respostaTratamento([resp(60, inicial), resp(2, atual)], HOJE)

    expect(resultado).toEqual({ tipo: esperado, inicial, atual, queda: inicial - atual })
  })
})

describe('textoVariacao', () => {
  it('descreve queda, subida e estabilidade', () => {
    expect(textoVariacao(18, 11)).toBe('18 → 11, caiu 7')
    expect(textoVariacao(12, 15)).toBe('12 → 15, subiu 3')
    expect(textoVariacao(13, 13)).toBe('13 → 13, não mudou')
  })
})

describe('lacunas', () => {
  it('não marca lacuna até 7 dias depois da data prevista', () => {
    expect(lacunas(acomp(40), [resp(38, 10), resp(17, 10)], HOJE)).toEqual([])
  })

  it('marca lacuna entre respostas quando a seguinte veio 8 dias depois da prevista', () => {
    const resultado = lacunas(acomp(40), [resp(38, 10), resp(16, 10)], HOJE)

    expect(resultado).toEqual([{ de: somarDias(HOJE, -24), ate: somarDias(HOJE, -16) }])
  })

  it('marca lacuna aberta até hoje quando a última resposta passou do prazo', () => {
    const resultado = lacunas(acomp(30), [resp(24, 10)], HOJE)

    expect(resultado).toEqual([{ de: somarDias(HOJE, -10), ate: HOJE }])
  })
})
