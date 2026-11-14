import type { MotivoEncerramento, MotivoTransferencia, Periodicidade } from './tipos'

export const MOTIVOS_ENCERRAMENTO: Record<MotivoEncerramento, string> = {
  remissao: 'Remissão',
  'mudanca-unidade': 'Mudança de unidade',
  desistencia: 'Desistência do paciente',
  outro: 'Outro',
}

export const MOTIVOS_TRANSFERENCIA: Record<MotivoTransferencia, string> = {
  ferias: 'Férias',
  afastamento: 'Afastamento',
  desligamento: 'Desligamento',
  outro: 'Outro',
}

export const PERIODICIDADES: Periodicidade[] = [14, 21, 28]
