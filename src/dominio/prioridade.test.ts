import { describe, expect, it } from 'vitest'
import { ordenarPorPrioridade } from './prioridade'

const item = (id: string, pensamentosNaUltima: boolean, pontuacao: number | null, encaminhadoEm: string) => ({
  id,
  pensamentosNaUltima,
  pontuacao,
  encaminhadoEm,
})

describe('ordenarPorPrioridade', () => {
  it('põe pensamentos de se ferir na última resposta antes de pontuação mais alta', () => {
    const ordem = ordenarPorPrioridade([item('grave', false, 24, '2026-11-01'), item('risco', true, 12, '2026-11-20')])
    expect(ordem.map((i) => i.id)).toEqual(['risco', 'grave'])
  })

  it('no mesmo grupo, a pontuação mais alta vem antes', () => {
    const ordem = ordenarPorPrioridade([item('16', false, 16, '2026-11-01'), item('19', false, 19, '2026-11-20')])
    expect(ordem.map((i) => i.id)).toEqual(['19', '16'])
  })

  it('com a mesma pontuação, quem foi encaminhado antes vem antes', () => {
    const ordem = ordenarPorPrioridade([item('novo', false, 17, '2026-11-20'), item('antigo', false, 17, '2026-10-02')])
    expect(ordem.map((i) => i.id)).toEqual(['antigo', 'novo'])
  })

  it('sem resposta vai para o fim do grupo', () => {
    const ordem = ordenarPorPrioridade([item('sem', false, null, '2026-10-01'), item('leve', false, 6, '2026-11-20')])
    expect(ordem.map((i) => i.id)).toEqual(['leve', 'sem'])
  })
})
