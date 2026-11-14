import { describe, expect, it } from 'vitest'
import { situacaoEncaminhamento } from './encaminhamento'

const resposta = { data: '2026-11-20', conduta: 'c', medicacao: 'm', reencaminharSe: 'r' }

describe('situacaoEncaminhamento', () => {
  it('é novo enquanto o psiquiatra não abriu', () => {
    expect(situacaoEncaminhamento({})).toBe('novo')
  })

  it('avança para visto, consulta marcada e respondido', () => {
    expect(situacaoEncaminhamento({ vistoEm: '2026-11-10' })).toBe('visto')
    expect(situacaoEncaminhamento({ vistoEm: '2026-11-10', consulta: { data: '2026-11-18', marcadaEm: '2026-11-10' } })).toBe(
      'consulta-marcada',
    )
    expect(
      situacaoEncaminhamento({
        vistoEm: '2026-11-10',
        consulta: { data: '2026-11-18', marcadaEm: '2026-11-10' },
        contrarreferencia: resposta,
      }),
    ).toBe('respondido')
  })

  it('a contrarreferência fecha o encaminhamento mesmo sem consulta registrada', () => {
    expect(situacaoEncaminhamento({ contrarreferencia: resposta })).toBe('respondido')
  })
})
