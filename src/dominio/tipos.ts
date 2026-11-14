export type Perfil = 'paciente' | 'profissional' | 'psiquiatra'

export type Canal = 'whatsapp' | 'site' | 'unidade' | 'visita'

export type Estressor = 'trabalho' | 'familia' | 'dinheiro' | 'saude' | 'moradia' | 'luto' | 'outro'

export type Periodicidade = 14 | 21 | 28

export type MotivoEncerramento = 'remissao' | 'mudanca-unidade' | 'desistencia' | 'outro'

export type MotivoTransferencia = 'ferias' | 'afastamento' | 'desligamento' | 'outro'

export interface CadastroEsus {
  id: string
  nome: string
  nascimento: string
  celular?: string
  escolaridade: string
  trabalho: string
  grupoComunitario: string
}

export interface Usuario {
  id: string
  nome: string
  perfil: Perfil
  funcao: string
  cpf?: string
  senha?: string
  pacienteId?: string
}

export interface Resposta {
  id: string
  pacienteId: string
  data: string
  canal: Canal
  itens: number[]
  estressores: Estressor[]
  outroEstressor?: string
  registradoPor?: string
}

export interface Acompanhamento {
  id: string
  pacienteId: string
  inicio: string
  periodicidade: Periodicidade
  responsavelId: string
  encerramento?: { data: string; motivo: MotivoEncerramento; detalhe?: string; porId: string }
}

export interface ResumoEncaminhamento {
  pontuacaoInicial: number | null
  pontuacaoAtual: number | null
  semanas: number
  pergunta9: { data: string; valor: number }[]
  estressores: { estressor: Estressor; vezes: number }[]
  contexto: { escolaridade: string; trabalho: string; grupoComunitario: string }
}

export interface Encaminhamento {
  id: string
  pacienteId: string
  psiquiatraId: string
  profissionalId: string
  data: string
  motivo: string
  prejuizoFuncional: string
  tratamentos: string
  resumo: ResumoEncaminhamento
  vistoEm?: string
  contrarreferencia?: Contrarreferencia
}

export interface Contrarreferencia {
  data: string
  conduta: string
  medicacao: string
  reencaminharSe: string
}

export interface Transferencia {
  id: string
  tipo: 'acompanhamento' | 'encaminhamento'
  pacienteId: string
  deId: string
  paraId: string
  motivo: MotivoTransferencia
  detalhe?: string
  data: string
  porId: string
}
