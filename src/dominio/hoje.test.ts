import { describe, expect, it } from 'vitest'
import { dataPorExtenso, dataRelativa } from './hoje'

describe('dataPorExtenso', () => {
  it('escreve o dia da semana sem deslocar a data pelo fuso', () => {
    expect(dataPorExtenso('2026-11-27')).toBe('Sexta-feira, 27 de novembro')
    expect(dataPorExtenso('2026-12-01')).toBe('Terça-feira, 1 de dezembro')
  })
})

describe('dataRelativa', () => {
  const hoje = '2026-11-27'

  it('usa palavras para os dias vizinhos', () => {
    expect(dataRelativa('2026-11-27', hoje)).toBe('Hoje')
    expect(dataRelativa('2026-11-26', hoje)).toBe('Ontem')
    expect(dataRelativa('2026-11-28', hoje)).toBe('Amanhã')
  })

  it('usa o dia da semana dentro de 6 dias e o dia do mês depois disso', () => {
    expect(dataRelativa('2026-11-21', hoje)).toBe('Sábado')
    expect(dataRelativa('2026-12-03', hoje)).toBe('Quinta')
    expect(dataRelativa('2026-11-20', hoje)).toBe('20 de nov')
  })

  it('mostra o ano quando a data é de outro ano', () => {
    expect(dataRelativa('2025-11-20', hoje)).toBe('20/11/2025')
  })
})
