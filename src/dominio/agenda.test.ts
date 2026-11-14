import { describe, expect, it } from 'vitest'
import { dataPrevista, lembretes } from './agenda'
import { HOJE, somarDias } from './hoje'
import { acomp, resp } from './teste-apoio'
import type { CadastroEsus } from './tipos'

const cadastro: CadastroEsus = {
  id: 'p',
  nome: 'Paciente',
  nascimento: '1980-01-01',
  celular: '(47) 99999-0000',
  escolaridade: '',
  trabalho: '',
  grupoComunitario: '',
}

describe('dataPrevista', () => {
  it('soma a periodicidade à última resposta', () => {
    expect(dataPrevista(acomp(60, 21), [resp(50, 10), resp(10, 10)])).toBe(somarDias(HOJE, 11))
  })

  it('sem resposta, soma a periodicidade ao início', () => {
    expect(dataPrevista(acomp(3, 28), [])).toBe(somarDias(HOJE, 25))
  })
})

describe('lembretes', () => {
  it('na data prevista e 3 dias depois', () => {
    expect(lembretes(cadastro, acomp(30), [resp(10, 10)])).toEqual([somarDias(HOJE, 4), somarDias(HOJE, 7)])
  })

  it('quem não tem celular não recebe lembrete', () => {
    expect(lembretes({ ...cadastro, celular: undefined }, acomp(30), [resp(10, 10)])).toEqual([])
  })
})
