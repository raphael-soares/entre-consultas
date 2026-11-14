import { itensPara } from '@/dados/fixtures'
import { HOJE, somarDias } from './hoje'
import type { Acompanhamento, Periodicidade, Resposta } from './tipos'

export function acomp(inicioDiasAtras: number, periodicidade: Periodicidade = 14): Acompanhamento {
  return {
    id: 'a',
    pacienteId: 'p',
    inicio: somarDias(HOJE, -inicioDiasAtras),
    periodicidade,
    responsavelId: 'r',
  }
}

export function resp(diasAtras: number, total: number, pergunta9 = 0): Resposta {
  return {
    id: `r${diasAtras}`,
    pacienteId: 'p',
    data: somarDias(HOJE, -diasAtras),
    canal: 'site',
    itens: itensPara(total, pergunta9),
    estressores: [],
  }
}
